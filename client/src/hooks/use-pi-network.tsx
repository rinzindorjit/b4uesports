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
    let authTimeout: NodeJS.Timeout | null = null;
    
    try {
      // Show initial loading message
      toast({
        title: "Connecting to Pi Network",
        description: "Loading Pi SDK...",
      });

      // Reset SDK state to ensure clean initialization
      piSDK.reset();
      
      // Add a timeout for the entire authentication process
      authTimeout = setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Authentication Timeout",
          description: "The authentication process is taking longer than expected. Please check your Pi Browser for pending requests or try again.",
          variant: "destructive",
        });
      }, 120000);

      // Define the onIncompletePaymentFound callback
      const onIncompletePaymentFound = (payment: PaymentDTO) => {
        console.log('Incomplete payment found:', payment);
        toast({
          title: "Incomplete Payment Found",
          description: `Please complete your previous payment of ${payment.amount} π for "${payment.memo}"`,
          variant: "destructive",
        });
      };

      // Update toast to show SDK initialization
      toast({
        title: "Connecting to Pi Network",
        description: "Initializing Pi SDK...",
      });

      // Initialize Pi SDK
      console.log('Initializing Pi SDK...');
      await piSDK.init(true); // Always use sandbox for Testnet
      
      // Update toast to show authentication request
      toast({
        title: "Connecting to Pi Network",
        description: "Please check your Pi Browser for authentication request...",
      });

      // Perform authentication
      console.log('Starting authentication...');
      const authResult = await piSDK.authenticate(['payments', 'username'], onIncompletePaymentFound);
      
      // Clear the timeout if authentication completes
      if (authTimeout) {
        clearTimeout(authTimeout);
        authTimeout = null;
      }
      
      if (!authResult) {
        throw new Error('Authentication failed. Please try again.');
      }

      // Update toast to show backend verification
      toast({
        title: "Verifying Account",
        description: "Please wait while we verify your credentials...",
      });

      // Send access token to backend for verification
      const response = await apiRequest('POST', '/api/users', {
        action: 'authenticate',
        data: {
          accessToken: authResult.accessToken,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Verification failed with status ${response.status}`);
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
        title: "Login Successful",
        description: `Welcome, ${data.user.username}!`,
      });
      
      console.log('Authentication completed');
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      
      // Clear the timeout if it exists
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
      
      let errorMessage = "Failed to connect to Pi Network. Please make sure you're using the Pi Browser app.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Provide more specific guidance
      if (errorMessage.includes('Pi SDK not available')) {
        errorMessage = "Pi SDK not available. Please make sure you're using the Pi Browser app and refresh the page.";
      } else if (errorMessage.includes('timeout')) {
        errorMessage = "Authentication timed out. Please check your Pi Browser for pending requests. On mobile, look for a notification banner.";
      } else if (errorMessage.includes('cancelled')) {
        errorMessage = "Authentication was cancelled. Please try again and approve the authentication request in the Pi Browser.";
      } else if (errorMessage.includes('initialize')) {
        errorMessage = "Failed to initialize Pi SDK. Please refresh the page and try again.";
      } else if (errorMessage.includes('load')) {
        errorMessage = "Failed to load Pi SDK. Please check your internet connection and make sure you are using the Pi Browser app.";
      }
      
      toast({
        title: "Login Failed",
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

    const enhancedPaymentData = {
      ...paymentData,
      metadata: {
        ...paymentData.metadata,
        type: 'backend' as const,
        userId: user.id,
      },
    };

    const enhancedCallbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        try {
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