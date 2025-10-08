import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { piSDK } from '@/lib/pi-sdk';
import { apiRequest } from '@/lib/queryClient';
import type { User, PaymentData, PaymentCallbacks, PaymentDTO } from '@/types/pi-network';

interface PiNetworkContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  authenticate: () => Promise<void>;
  logout: () => void;
  createPayment: (paymentData: PaymentData, callbacks: PaymentCallbacks) => void;
  token: string | null;
}

const PiNetworkContext = createContext<PiNetworkContextType | undefined>(undefined);

interface PiNetworkProviderProps {
  children: ReactNode;
}

export function PiNetworkProvider({ children }: PiNetworkProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Validate token with backend
  const validateToken = async (userToken: string) => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
    }
    return null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for existing session
      const savedToken = localStorage.getItem('pi_token');
      const savedUser = localStorage.getItem('pi_user');
      
      if (savedToken && savedUser) {
        try {
          // Validate token with backend
          const userData = await validateToken(savedToken);
          if (userData) {
            setToken(savedToken);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear localStorage
            localStorage.removeItem('pi_token');
            localStorage.removeItem('pi_user');
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          // Clear invalid session data
          localStorage.removeItem('pi_token');
          localStorage.removeItem('pi_user');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const authenticate = async () => {
    // Prevent multiple simultaneous authentication attempts
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Show initial loading message
      toast({
        title: "Connecting to Pi Network",
        description: "Please wait while we connect to Pi Network...",
      });

      // Initialize Pi SDK if not already initialized
      // Always use sandbox mode for Testnet
      piSDK.init(true);

      // Define the onIncompletePaymentFound callback as required by Pi Network
      const onIncompletePaymentFound = (payment: PaymentDTO) => {
        console.log('Incomplete payment found:', payment);
        // Handle incomplete payment according to Pi Network requirements
        toast({
          title: "Incomplete Payment Found",
          description: `Please complete your previous payment of ${payment.amount} π for "${payment.memo}"`,
          variant: "destructive",
        });
        
        // According to Pi Network documentation, it's the developer's responsibility
        // to complete the corresponding payment when this callback is invoked
        // We'll try to complete it with the existing data
        const paymentData: PaymentData = {
          amount: payment.amount,
          memo: payment.memo,
          metadata: {
            type: 'backend',
            userId: payment.user_uid,
            packageId: payment.metadata?.packageId || '',
            gameAccount: payment.metadata?.gameAccount || {}
          }
        };
        
        createPayment(paymentData, {
          onReadyForServerApproval: (paymentId: string) => {
            toast({
              title: "Payment Approved",
              description: `Payment ${paymentId} approved by server`,
            });
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            toast({
              title: "Payment Completed",
              description: `✅ Previous payment confirmed! Transaction ID: ${txid}`,
            });
          },
          onCancel: (paymentId: string) => {
            toast({
              title: "Payment Cancelled",
              description: "❌ Previous payment canceled. No Pi deducted.",
              variant: "destructive",
            });
          },
          onError: (error: Error) => {
            toast({
              title: "Payment Failed",
              description: `⚠️ Previous payment failed: ${error.message}. Please retry.`,
              variant: "destructive",
            });
          },
        });
      };

      // Add a timeout for the entire authentication process
      // Use 180 seconds as recommended for mobile compatibility (increased from 120)
      const authTimeout = setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Authentication Timeout",
          description: "The authentication process is taking longer than expected. Please check your Pi Browser for pending requests. On mobile, look for a notification banner. If you don't see a prompt, try refreshing the page or restarting the Pi Browser app.",
          variant: "destructive",
        });
      }, 180000);

      // Authenticate with Pi Network using required scopes
      // Add retry mechanism for better reliability
      let authResult = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !authResult) {
        try {
          attempts++;
          console.log(`Authentication attempt ${attempts}/${maxAttempts}`);
          
          // Show attempt number in toast for better user feedback
          if (attempts > 1) {
            toast({
              title: `Authentication Attempt ${attempts}/${maxAttempts}`,
              description: "Retrying authentication with Pi Network...",
            });
          }
          
          authResult = await piSDK.authenticate(['payments', 'username'], onIncompletePaymentFound);
          
          if (!authResult && attempts < maxAttempts) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Authentication attempt ${attempts} failed:`, error);
          
          // If it's a timeout error, don't retry
          if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('User closed'))) {
            throw error;
          }
          
          // If it's the last attempt, throw the error
          if (attempts >= maxAttempts) {
            throw new Error(`Authentication failed after ${maxAttempts} attempts. ${error instanceof Error ? error.message : 'Please try again.'}`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      clearTimeout(authTimeout); // Clear the timeout if authentication completes
      
      if (!authResult) {
        throw new Error('Authentication failed - No response from Pi Network after multiple attempts');
      }

      // Update toast to show backend verification
      toast({
        title: "Verifying with Backend",
        description: "Please wait while we verify your credentials...",
      });

      // Send access token to backend for verification according to Pi Network guidelines
      // The user information obtained with this method should not be passed to your backend
      // and should only be used for presentation logic
      const response = await apiRequest('POST', '/api/users', {
        action: 'authenticate',
        data: {
          accessToken: authResult.accessToken,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Backend verification failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('pi_token', data.token);
      localStorage.setItem('pi_user', JSON.stringify(data.user));
      
      // Show success message
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${data.user.username}!`,
      });
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      
      // Show error toast with more specific information
      let errorMessage = "Failed to connect to Pi Network. Please make sure you're using the Pi Browser and try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Provide more specific guidance based on error type
      if (errorMessage.includes('Pi SDK not available')) {
        errorMessage += " Make sure you're using the Pi Browser app, not a regular web browser.";
      } else if (errorMessage.includes('timeout')) {
        errorMessage += " Check your Pi Browser for pending authentication requests and approve them. On mobile, look for a notification banner. If you don't see a prompt, try refreshing the page or restarting the Pi Browser app.";
      } else if (errorMessage.includes('Invalid Pi Network token')) {
        errorMessage += " Please try again and make sure you approve the authentication request in the Pi Browser.";
      } else if (errorMessage.includes('Backend verification failed')) {
        errorMessage += " There might be an issue with our servers. Please try again later.";
      } else if (errorMessage.includes('cancelled') || errorMessage.includes('User closed')) {
        errorMessage = "Authentication was cancelled. Please try again and approve the authentication request in the Pi Browser.";
      }
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      // Always ensure loading state is cleared
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('pi_token');
    localStorage.removeItem('pi_user');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const createPayment = (paymentData: PaymentData, callbacks: PaymentCallbacks) => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    // Add user context to metadata as required by Pi Network
    const enhancedPaymentData = {
      ...paymentData,
      metadata: {
        ...paymentData.metadata,
        type: 'backend' as const,
        userId: user.id,
      },
    };

    // Enhanced callbacks with API calls for server-side approval and completion
    const enhancedCallbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        try {
          // Server-Side Approval as required by Pi Network
          const response = await apiRequest('POST', '/api/payments', {
            action: 'approve',
            data: { paymentId }
          });
          
          if (!response.ok) {
            throw new Error(`Server approval failed with status ${response.status}`);
          }
          
          callbacks.onReadyForServerApproval(paymentId);
        } catch (error) {
          console.error('Payment approval failed:', error);
          callbacks.onError(error as Error);
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        try {
          // Server-Side Completion as required by Pi Network
          const response = await apiRequest('POST', '/api/payments', {
            action: 'complete',
            data: { paymentId, txid }
          });
          
          if (!response.ok) {
            throw new Error(`Server completion failed with status ${response.status}`);
          }
          
          callbacks.onReadyForServerCompletion(paymentId, txid);
        } catch (error) {
          console.error('Payment completion failed:', error);
          callbacks.onError(error as Error);
        }
      },
      onCancel: (paymentId: string) => {
        toast({
          title: "Payment Cancelled",
          description: "Payment was cancelled. No Pi was deducted.",
        });
        callbacks.onCancel(paymentId);
      },
      onError: (error: Error, payment?: any) => {
        toast({
          title: "Payment Error",
          description: error.message || "An error occurred during payment processing.",
          variant: "destructive",
        });
        callbacks.onError(error, payment);
      },
    };

    piSDK.createPayment(enhancedPaymentData, enhancedCallbacks);
  };

  return (
    <PiNetworkContext.Provider value={{
      isAuthenticated,
      user,
      isLoading,
      authenticate,
      logout,
      createPayment,
      token,
    }}>
      {children}
    </PiNetworkContext.Provider>
  );
}

export function usePiNetwork() {
  const context = useContext(PiNetworkContext);
  if (context === undefined) {
    throw new Error('usePiNetwork must be used within a PiNetworkProvider');
  }
  return context;
}