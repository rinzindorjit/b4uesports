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

  useEffect(() => {
    // Initialize Pi SDK
    const isProduction = process.env.NODE_ENV === 'production';
    // Always use sandbox mode for Testnet
    piSDK.init(true); // sandbox mode for Testnet

    // Check for existing session
    const savedToken = localStorage.getItem('pi_token');
    const savedUser = localStorage.getItem('pi_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const authenticate = async () => {
    setIsLoading(true);
    try {
      // Define the onIncompletePaymentFound callback
      const onIncompletePaymentFound = (payment: PaymentDTO) => {
        console.log('Incomplete payment found:', payment);
        // Handle incomplete payment
        toast({
          title: "Incomplete Payment Found",
          description: `Please complete your previous payment of ${payment.amount} π for "${payment.memo}"`,
          variant: "destructive",
        });
        
        // Try to complete the payment with minimal metadata
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

      const authResult = await piSDK.authenticate(['payments', 'username'], onIncompletePaymentFound);
      if (!authResult) {
        throw new Error('Authentication failed');
      }

      // Send access token to backend for verification
      const response = await apiRequest('POST', '/api/users', {
        action: 'authenticate',
        data: {
          accessToken: authResult.accessToken,
        }
      });
      
      const data = await response.json();
      
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('pi_token', data.token);
      localStorage.setItem('pi_user', JSON.stringify(data.user));
      
    } catch (error) {
      console.error('Authentication error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('pi_token');
    localStorage.removeItem('pi_user');
  };

  const createPayment = (paymentData: PaymentData, callbacks: PaymentCallbacks) => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    // Add user context to metadata
    const enhancedPaymentData = {
      ...paymentData,
      metadata: {
        ...paymentData.metadata,
        type: 'backend' as const,
        userId: user.id,
      },
    };

    // Enhanced callbacks with API calls
    const enhancedCallbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        try {
          await apiRequest('POST', '/api/payments', {
            action: 'approve',
            data: { paymentId }
          });
          callbacks.onReadyForServerApproval(paymentId);
        } catch (error) {
          console.error('Payment approval failed:', error);
          callbacks.onError(error as Error);
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        try {
          await apiRequest('POST', '/api/payments', {
            action: 'complete',
            data: { paymentId, txid }
          });
          callbacks.onReadyForServerCompletion(paymentId, txid);
        } catch (error) {
          console.error('Payment completion failed:', error);
          callbacks.onError(error as Error);
        }
      },
      onCancel: callbacks.onCancel,
      onError: callbacks.onError,
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