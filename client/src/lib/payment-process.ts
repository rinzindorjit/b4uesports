// Payment process utility for Pi Network integration
import { apiRequest } from './queryClient';

/**
 * Complete payment process function
 * This function handles the entire Pi Network payment flow
 * 
 * @param amount - The amount to charge in Pi
 * @param memo - A description of the payment
 * @param metadata - Additional metadata for the payment
 * @returns Promise with payment result
 */
export async function processPayment(
  amount: number, 
  memo: string, 
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    console.log('=== PAYMENT PROCESS START ===');
    console.log('Payment details:', { amount, memo, metadata });

    // Robust Pi Browser detection function (matches server-side implementation)
    function isPiBrowser() {
      if (typeof window === 'undefined') return false;
      
      const userAgent = window.navigator.userAgent.toLowerCase();
      const xRequestedWith = (window as any).Pi ? 'pi.browser' : '';
      
      return (
        xRequestedWith === 'pi.browser' ||
        userAgent.includes('pi browser') ||
        userAgent.includes('pibrowser') ||
        userAgent.includes('pi network') ||
        // Additional checks for Pi Browser environment
        (window.location.hostname.includes('vercel.app')) ||
        (window.location.hostname.includes('netlify.app')) ||
        (window.location.hostname === 'localhost' && window.location.port === '5173')
      );
    }

    // Check if we're running in Pi Browser
    const isPiBrowserEnv = isPiBrowser();
    console.log('Pi Browser detection result:', isPiBrowserEnv);
    console.log('User agent:', window.navigator.userAgent);
    console.log('Window.Pi exists:', !!(window as any).Pi);

    // If we're in Pi Browser, use the Pi SDK directly
    if (isPiBrowserEnv && typeof window !== 'undefined' && (window as any).Pi) {
      console.log('Using Pi Browser SDK for payment');
      
      return new Promise((resolve) => {
        try {
          // Use Pi SDK directly for Pi Browser
          (window as any).Pi.createPayment({
            amount,
            memo,
            metadata
          }, {
            onReadyForServerApproval: async (paymentId: string) => {
              console.log('Payment approved, calling backend for approval:', paymentId);
              try {
                const approveResponse = await apiRequest('POST', '/api/payment/approve', {
                  paymentId
                });
                
                if (!approveResponse.ok) {
                  const errorData = await approveResponse.json();
                  throw new Error(`Failed to approve payment: ${errorData.message || approveResponse.statusText}`);
                }
                
                console.log('Payment approved successfully on backend');
              } catch (error) {
                console.error('Backend approval failed:', error);
              }
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              console.log('Payment completed, calling backend for completion:', paymentId, txid);
              try {
                const completeResponse = await apiRequest('POST', '/api/payment/complete', {
                  paymentId,
                  txid
                });
                
                if (!completeResponse.ok) {
                  const errorData = await completeResponse.json();
                  throw new Error(`Failed to complete payment: ${errorData.message || completeResponse.statusText}`);
                }
                
                console.log('Payment completed successfully on backend');
                resolve({
                  success: true,
                  paymentId
                });
              } catch (error) {
                console.error('Backend completion failed:', error);
                resolve({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
              }
            },
            onCancel: (paymentId: string) => {
              console.log('Payment cancelled:', paymentId);
              resolve({
                success: false,
                error: 'Payment cancelled by user'
              });
            },
            onError: (error: Error, payment?: any) => {
              console.error('Payment error:', error, payment);
              resolve({
                success: false,
                error: error.message || 'Payment failed'
              });
            }
          });
        } catch (error) {
          console.error('Pi SDK payment creation failed:', error);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          });
        }
      });
    }

    // For non-Pi Browser environments, we can't process real payments
    // In a real app, you would need to handle this case differently
    console.log('Not in Pi Browser - cannot process real payment');
    return {
      success: false,
      error: 'Payments can only be processed in Pi Browser'
    };
  } catch (error) {
    console.error('Payment process error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Verify payment status with Pi Network API
 * 
 * @param paymentId - The payment ID to verify
 * @returns Promise with verification result
 */
export async function verifyPayment(paymentId: string): Promise<{ verified: boolean; data?: any; error?: string }> {
  try {
    console.log('Verifying payment with Pi Network:', paymentId);
    
    // Call the backend verification endpoint which will call Pi Network API
    const response = await apiRequest('POST', '/api/pi?action=verify-payment', {
      paymentId
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to verify payment: ${errorData.message || response.statusText}`);
    }
    
    const verificationData = await response.json();
    console.log('Payment verification result:', verificationData);
    
    return {
      verified: verificationData.verified,
      data: verificationData.data || verificationData
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export default {
  processPayment,
  verifyPayment
};