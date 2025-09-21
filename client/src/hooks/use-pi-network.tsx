import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { piSDK } from '@/lib/pi-sdk';
import { apiRequest } from '@/lib/queryClient';
import type { User, PaymentData, PaymentCallbacks } from '@/types/pi-network';

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

  useEffect(() => {
    // Initialize Pi SDK
    const isProduction = import.meta.env.PROD;
    piSDK.init(!isProduction); // sandbox mode for development

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
      const authResult = await piSDK.authenticate(['payments', 'username']);
      if (!authResult) {
        throw new Error('Authentication failed');
      }

      // Send access token to backend for verification
      const response = await apiRequest('POST', '/api/auth/pi', {
        accessToken: authResult.accessToken,
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
          await apiRequest('POST', '/api/payment/approve', { paymentId });
          callbacks.onReadyForServerApproval(paymentId);
        } catch (error) {
          console.error('Payment approval failed:', error);
          callbacks.onError(error as Error);
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        try {
          await apiRequest('POST', '/api/payment/complete', { paymentId, txid });
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
