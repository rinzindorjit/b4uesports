import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { piSDK } from '../lib/pi-sdk';
import type { User, PaymentData, PaymentCallbacks } from '../types/pi-network';

interface PiNetworkContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  authenticate: () => Promise<void>;
  logout: () => void;
  createPayment: (paymentData: PaymentData, callbacks: PaymentCallbacks) => void;
  requestPayment: (amount: string, memo: string) => Promise<any>;
  token: string | null;
  isTestnet: boolean;
}

const PiNetworkContext = createContext<PiNetworkContextType | undefined>(undefined);

// Helper function for API requests
async function apiRequest(method: string, url: string, data?: any) {
  // Check if we're running on Vercel (safely check for process existence)
  const isVercel = typeof window !== 'undefined' && (window as any).__env__?.VERCEL === '1';
  // Fallback to checking if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  // Use a safer approach for environment detection
  const apiUrl = isBrowser ? (window as any).__env__?.VITE_API_URL || '' : '';
  
  // Construct full URL for local development, use relative URL for Vercel
  let fullUrl = url;
  if (!isVercel && apiUrl) {
    // When using a separate API URL (local development), use the full path
    fullUrl = url.startsWith('/api') ? `${apiUrl}${url}` : `${apiUrl}/api/${url}`;
  }
  // On Vercel, relative URLs will work correctly as frontend and backend are on the same domain
  
  const token = localStorage.getItem('pi_token');
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    // Add credentials for cross-origin requests if needed
    credentials: 'include',
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  console.log(`Making API request: ${method} ${fullUrl}`, data);
  return fetch(fullUrl, options);
}

export function PiNetworkProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTestnet] = useState(true); // Always use Testnet mode

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('pi_token');
    const storedUser = localStorage.getItem('pi_user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('pi_token');
        localStorage.removeItem('pi_user');
      }
    }
  }, []);

  const authenticate = async () => {
    setIsLoading(true);
    
    try {
      // Check if we're in the Pi Browser
      if (typeof window !== 'undefined') {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const isPiBrowser = userAgent && (userAgent.indexOf('PiBrowser') !== -1 || userAgent.indexOf('Pi Browser') !== -1);
        
        // Additional check for Pi object
        const hasPiObject = !!(window as any).Pi;
        
        // More comprehensive Pi Browser detection
        const isLikelyPiEnvironment = isPiBrowser || hasPiObject || 
          !!(window as any).PiNetwork || 
          !!(window as any).PiBrowser || 
          (window as any).webkit?.messageHandlers?.PiBrowser;
        
        // Only throw error if we're certain we're not in Pi Browser
        // Otherwise, show a warning and continue (more lenient approach)
        if (!isLikelyPiEnvironment) {
          console.warn('Pi Browser environment not detected, but continuing with authentication...');
          toast({
            title: "Environment Warning",
            description: "Pi Browser environment not detected. Authentication may not work properly if you're not using the official Pi Browser app.",
            variant: "destructive",
          });
        } else {
          console.log('Likely Pi Browser environment detected:', {
            isPiBrowser,
            hasPiObject,
            userAgent
          });
        }
        
        // If we detect we're in Pi Browser but Pi object is not available, wait a bit more
        if (isLikelyPiEnvironment && !hasPiObject) {
          console.log('Detected Pi Browser but Pi object not available yet, waiting...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check again
          if (!(window as any).Pi) {
            console.log('Still waiting for Pi object...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            if (!(window as any).Pi) {
              console.warn('Pi object still not available after waiting');
              toast({
                title: "Pi SDK Loading",
                description: "Pi SDK is still loading. Please wait a moment and check for any Pi Browser notification banners.",
              });
            }
          }
        }
      }
      
      // Handle incomplete payments as required by Pi Network
      const onIncompletePaymentFound = (payment: any) => {
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
              title: "✅ Payment Completed",
              description: `Previous payment confirmed on Testnet! Transaction ID: ${txid}`,
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
      // Use 180 seconds as recommended for mobile compatibility
      setAuthTimeout(setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Authentication Timeout",
          description: "The authentication process is taking longer than expected. Please check your Pi Browser for pending requests. On mobile, look for a notification banner. If you don't see a prompt, try refreshing the page or restarting the Pi Browser app.",
          variant: "destructive",
        });
      }, 180000));

      // Ensure Pi SDK is initialized before authentication
      if (!piSDK.isInitialized()) {
        console.log('Initializing Pi SDK with more lenient approach...');
        // Use sandbox mode for Testnet with more lenient initialization
        await piSDK.init(true);
      }

      // Add a small delay to ensure Pi object is fully loaded
      await new Promise(resolve => setTimeout(resolve, 1000));

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
              description: "Retrying authentication with Pi Network Testnet...",
            });
          }
          
          authResult = await piSDK.authenticate(['payments', 'username', 'wallet_address'], onIncompletePaymentFound);
          
          if (!authResult && attempts < maxAttempts) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Authentication attempt ${attempts} failed:`, error);
          
          // Special handling for "Discarding message" error - retry immediately
          if (error instanceof Error && error.message.includes('Discarding message')) {
            toast({
              title: "Pi Browser Issue Detected",
              description: "Pi Browser app not properly loaded. Retrying authentication...",
              variant: "destructive",
            });
            
            // Wait a bit longer before retrying this specific error
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              continue; // Continue to next attempt without incrementing error count
            }
          }
          
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
      
      // Clear the timeout if authentication completes
      if (authTimeout) {
        clearTimeout(authTimeout);
        setAuthTimeout(null);
      }
      
      if (!authResult) {
        throw new Error('Authentication failed - No response from Pi Network Testnet after multiple attempts');
      }

      // Update toast to show backend verification
      toast({
        title: "Verifying with Backend",
        description: "Please wait while we verify your credentials with our Testnet backend...",
      });

      // Send access token to backend for verification according to Pi Network guidelines
      // The user information obtained with this method should not be passed to your backend
      // and should only be used for presentation logic
      console.log('Sending authentication request to /api/pi-auth');
      const response = await apiRequest('POST', '/api/pi-auth', {
        token: authResult.accessToken,
      });
      console.log('Authentication response:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Authentication failed with error data:', errorData);
        throw new Error(errorData.message || `Backend verification failed with status ${response.status}`);
      }
      
      const userData = await response.json();
      console.log('Authentication successful, received data:', userData);
      
      // Create or update user in our mock storage
      const userId = userData.uid;
      // In a real implementation, you would store this in a database
      // For now, we'll create a mock user object
      const mockUser = {
        id: userId,
        username: userData.username,
        email: '',
        phone: '',
        country: 'Bhutan',
        language: 'en',
        walletAddress: userData.wallet_address || '',
        profileImage: '',
        gameAccounts: {},
        referralCode: ''
      };

      // Generate a mock token for session management
      const mockToken = btoa(JSON.stringify({ 
        pi_id: userId,
        username: userData.username,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      }));

      setUser(mockUser);
      setToken(mockToken);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('pi_token', mockToken);
      localStorage.setItem('pi_user', JSON.stringify(mockUser));
      
      // Show success message
      toast({
        title: "✅ Authentication Successful",
        description: `Welcome to Testnet mode, ${userData.username}!`,
      });
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      
      // Clear the timeout if it exists
      if (authTimeout) {
        clearTimeout(authTimeout);
        setAuthTimeout(null);
      }
      
      // Show error toast with more specific information
      let errorMessage = "Failed to connect to Pi Network Testnet. Please make sure you're using the Pi Browser and try again.";
      
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
        errorMessage += " There might be an issue with our Testnet servers. Please try again later.";
      } else if (errorMessage.includes('cancelled') || errorMessage.includes('User closed')) {
        errorMessage = "Authentication was cancelled. Please try again and approve the authentication request in the Pi Browser.";
      } else if (errorMessage.includes('load')) {
        errorMessage += " Failed to load Pi SDK. Please check your internet connection and make sure you are using the Pi Browser app.";
      } else if (errorMessage.includes('Please open this app in the Pi Browser')) {
        errorMessage = "We detected that you might not be using the official Pi Browser app. Please make sure you're using the Pi Browser app from the official Pi Network website or app store. If you are already using the Pi Browser, try refreshing the page.";
      } else if (errorMessage.includes('Discarding message')) {
        errorMessage = "The Pi Browser app is not properly loaded. Please close and reopen the Pi Browser app, then try authenticating again. If the problem persists, restart your device and try once more.";
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
    
    // Reset Pi SDK state
    piSDK.reset();
    
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
        userId: user.id, // Include userId in metadata for better tracking
      },
    };

    // Enhanced callbacks with API calls for server-side approval and completion
    const enhancedCallbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        try {
          console.log('Sending payment for server approval:', paymentId);
          // Server-Side Approval as required by Pi Network
          const response = await apiRequest('POST', '/api/payments', {
            action: 'approve',
            data: { paymentId } // Send consistent data structure
          });
          
          const responseText = await response.text();
          console.log('Server approval response:', response.status, responseText);
          
          // Try to parse JSON, but handle if it's not JSON
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse server approval response as JSON:', responseText);
            throw new Error(`Server approval failed: ${responseText}`);
          }
          
          if (!response.ok) {
            throw new Error(`Server approval failed with status ${response.status}: ${responseData.message || responseText}`);
          }
          
          callbacks.onReadyForServerApproval(paymentId);
        } catch (error) {
          console.error('Payment approval failed:', error);
          callbacks.onError(error as Error);
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        try {
          console.log('Sending payment for server completion:', paymentId, txid);
          // Server-Side Completion as required by Pi Network
          const response = await apiRequest('POST', '/api/payments', {
            action: 'complete',
            data: { paymentId, txid } // Send consistent data structure
          });
          
          const responseText = await response.text();
          console.log('Server completion response:', response.status, responseText);
          
          // Try to parse JSON, but handle if it's not JSON
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse server completion response as JSON:', responseText);
            throw new Error(`Server completion failed: ${responseText}`);
          }
          
          if (!response.ok) {
            throw new Error(`Server completion failed with status ${response.status}: ${responseData.message || responseText}`);
          }
          
          // Refresh user data to update balance and transaction history
          refreshUserData();
          
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
        // Check if the error is related to missing payment scope
        if (error.message && (error.message.includes('without payment scope') || error.message.includes('payments" scope'))) {
          toast({
            title: "Re-authentication Required",
            description: "Payment permissions are missing. Please re-authenticate to enable payment permissions.",
            variant: "destructive",
          });
          
          // Trigger re-authentication
          authenticate();
        } else {
          toast({
            title: "Payment Error",
            description: error.message || "An error occurred during payment processing.",
            variant: "destructive",
          });
        }
        callbacks.onError(error, payment);
      },
    };

    piSDK.createPayment(enhancedPaymentData, enhancedCallbacks);
  };

  // New function for request-based payments with server-side approval
  const requestPayment = async (amount: string, memo: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    try {
      // First, request the payment from the user
      const result = await piSDK.requestPayment(amount, memo);
      
      if (result && result.transaction_id) {
        console.log('Payment requested, now approving with server:', result.transaction_id);
        
        // Then, send to server for approval with consistent data structure
        const response = await apiRequest('POST', '/api/payments', {
          action: 'approve',
          data: { 
            transaction_id: result.transaction_id, // Use transaction_id as the identifier
            userId: user.id, // Include userId for tracking
            amount: amount,
            memo: memo
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Server approval failed: ${errorData.error || response.statusText}`);
        }
        
        const approvalData = await response.json();
        console.log('Server approval response:', approvalData);
        
        if (approvalData && approvalData.status === 'approved') {
          toast({
            title: "✅ Payment Successful",
            description: "Your payment was processed successfully!",
          });
          
          // Refresh user data to update transaction history
          refreshUserData();
          return approvalData;
        } else {
          throw new Error('Payment approval failed');
        }
      } else {
        throw new Error('Payment request failed - no transaction ID received');
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment processing. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to refresh user data after payment completion
  const refreshUserData = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await apiRequest('GET', '/api/users?action=me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('pi_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [token]);

  return (
    <PiNetworkContext.Provider value={{
      isAuthenticated,
      user,
      isLoading,
      authenticate,
      logout,
      createPayment,
      requestPayment,
      token,
      isTestnet,
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