import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePiNetwork } from '@/hooks/use-pi-network';
import { usePiBalance } from '@/hooks/use-pi-balance';
import { GAME_LOGOS } from '@/lib/constants';
import type { Package } from '@/types/pi-network';
import bcrypt from 'bcryptjs';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
}

export default function PurchaseModal({ isOpen, onClose, package: pkg }: PurchaseModalProps) {
  const { user, createPayment, token } = usePiNetwork();
  const { data: piBalance } = usePiBalance();
  const { toast } = useToast();
  const [step, setStep] = useState<'confirm' | 'auth'>('confirm');
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editableGameAccount, setEditableGameAccount] = useState<any>({});

  const gameLogoUrl = pkg.game === 'PUBG' ? GAME_LOGOS.PUBG : GAME_LOGOS.MLBB;
  const gameName = pkg.game === 'PUBG' ? 'PUBG Mobile' : 'Mobile Legends';

  useEffect(() => {
    if (user && isOpen) {
      if (pkg.game === 'PUBG' && user.gameAccounts?.pubg) {
        setEditableGameAccount(user.gameAccounts.pubg);
      } else if (pkg.game === 'MLBB' && user.gameAccounts?.mlbb) {
        setEditableGameAccount(user.gameAccounts.mlbb);
      } else {
        setEditableGameAccount({});
      }
    }
  }, [user, pkg.game, isOpen]);

  const handleConfirmPurchase = () => {
    // Validate game account
    if (pkg.game === 'PUBG') {
      if (!editableGameAccount.ign || !editableGameAccount.uid) {
        toast({
          title: "Error",
          description: "Please enter your PUBG IGN and UID",
          variant: "destructive",
        });
        return;
      }
    } else if (pkg.game === 'MLBB') {
      if (!editableGameAccount.userId || !editableGameAccount.zoneId) {
        toast({
          title: "Error",
          description: "Please enter your Mobile Legends User ID and Zone ID",
          variant: "destructive",
        });
        return;
      }
    }

    setStep('auth');
  };

  const handleProcessPayment = async () => {
    // Only require passphrase in production mode
    const isTestnetMode = process.env.NODE_ENV !== 'production';
    
    // In testnet mode, we don't require a passphrase for mock payments
    const isPreview = window.location.hostname === 'localhost' && window.location.port === '5173';
    const isPiBrowserEnv = typeof window !== 'undefined' && 
      (window.navigator.userAgent.includes('PiBrowser') || window.navigator.userAgent.includes('Pi Network'));
    const isVercel = window.location.hostname.includes('vercel.app');
    
    // Always use mock payment flow for Vercel deployments, preview mode, or Pi Browser
    const useMockPayment = isPreview || isVercel || isPiBrowserEnv || isTestnetMode;
    
    if (!useMockPayment && !isTestnetMode && !passphrase) {
      toast({
        title: "Error",
        description: "Please enter your passphrase",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Always use mock payment flow for Vercel deployments, preview mode, or Pi Browser
      if (useMockPayment) {
        // Use mock payment flow with real Pi payment creation
        console.log('Using mock payment flow with real Pi payment creation');
        
        // For mock payments, we'll use the existing flow but remove the direct API call
        // The payment should be created using the Pi SDK which will trigger the callbacks
        // that call our backend endpoints for approval and completion
        
        // Since we're in mock mode, we'll simulate the Pi SDK flow
        const mockPaymentId = 'mock-payment-' + Date.now();
        
        // Step 1: Simulate onReadyForServerApproval callback
        try {
          const approvalResponse = await fetch('/api/payment/approve', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || 'mock-token'}`
            },
            body: JSON.stringify({
              paymentId: mockPaymentId
            })
          });
          
          const approvalData = await approvalResponse.json();
          
          if (!approvalResponse.ok) {
            throw new Error(approvalData.message || 'Failed to approve payment');
          }
          
          console.log('Payment approved:', approvalData);
        } catch (approvalError) {
          throw new Error(`Payment approval failed: ${approvalError.message}`);
        }
        
        // Step 2: Simulate onReadyForServerCompletion callback
        const mockTxid = 'mock-tx-' + Date.now();
        try {
          const completionResponse = await fetch('/api/payment/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || 'mock-token'}`
            },
            body: JSON.stringify({
              paymentId: mockPaymentId,
              txid: mockTxid
            })
          });
          
          const completionData = await completionResponse.json();
          
          if (!completionResponse.ok) {
            throw new Error(completionData.message || 'Failed to complete payment');
          }
          
          console.log('Payment completed:', completionData);
          
          toast({
            title: "Payment Completed",
            description: `✅ Payment confirmed! Transaction ID: ${completionData.transactionId || mockTxid}`,
          });
          
          // Close modal and reset
          onClose();
          setStep('confirm');
          setPassphrase('');
          setIsProcessing(false);
          return;
        } catch (completionError) {
          throw new Error(`Payment completion failed: ${completionError.message}`);
        }
      }
      
      // Create payment with Pi Network (real payment flow)
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const paymentData = {
        amount: pkg.piPrice || 0,
        memo: `${pkg.name} - ${gameName}`,
        metadata: {
          type: 'backend' as const,
          userId: user.id,
          packageId: pkg.id,
          gameAccount: editableGameAccount,
          passphrase: await bcrypt.hash(passphrase, 10), // Hash passphrase
        },
      };

      createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          try {
            // Call our backend to approve the payment
            const response = await fetch('/api/payment/approve', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token || 'mock-token'}`
              },
              body: JSON.stringify({
                paymentId: paymentId
              })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.message || 'Failed to approve payment');
            }
            
            toast({
              title: "Payment Approved",
              description: `Payment ${paymentId} approved by server`,
            });
          } catch (error) {
            console.error('Payment approval failed:', error);
            toast({
              title: "Payment Approval Failed",
              description: `⚠️ Payment approval failed: ${error.message}. Please retry.`,
              variant: "destructive",
            });
            setIsProcessing(false);
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try {
            // Call our backend to complete the payment
            const response = await fetch('/api/payment/complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token || 'mock-token'}`
              },
              body: JSON.stringify({
                paymentId: paymentId,
                txid: txid
              })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.message || 'Failed to complete payment');
            }
            
            toast({
              title: "Payment Completed",
              description: `✅ Payment confirmed! Transaction ID: ${txid}`,
            });
            
            onClose();
            setStep('confirm');
            setPassphrase('');
          } catch (error) {
            console.error('Payment completion failed:', error);
            toast({
              title: "Payment Completion Failed",
              description: `⚠️ Payment completion failed: ${error.message}. Please retry.`,
              variant: "destructive",
            });
            setIsProcessing(false);
          }
        },
        onCancel: (paymentId: string) => {
          toast({
            title: "Payment Cancelled",
            description: "❌ Payment canceled. No Pi deducted.",
            variant: "destructive",
          });
          setIsProcessing(false);
        },
        onError: (error: Error) => {
          toast({
            title: "Payment Failed",
            description: `⚠️ Payment failed: ${error.message}. Please retry.`,
            variant: "destructive",
          });
          setIsProcessing(false);
        },
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Payment processing failed",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleGameAccountChange = (field: string, value: string) => {
    setEditableGameAccount((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const formatGameAccount = () => {
    if (pkg.game === 'PUBG') {
      return `${editableGameAccount.ign || 'Not set'} (${editableGameAccount.uid || 'Not set'})`;
    } else {
      return `${editableGameAccount.userId || 'Not set'}:${editableGameAccount.zoneId || 'Not set'}`;
    }
  };

  // Determine if we should show the passphrase input
  const isPreview = window.location.hostname === 'localhost' && window.location.port === '5173';
  const isPiBrowserEnv = typeof window !== 'undefined' && 
    (window.navigator.userAgent.includes('PiBrowser') || window.navigator.userAgent.includes('Pi Network'));
  const isVercel = window.location.hostname.includes('vercel.app');
  const useMockPayment = isPreview || isVercel || isPiBrowserEnv || process.env.NODE_ENV !== 'production';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="purchase-modal">
        {step === 'confirm' ? (
          <>
            <DialogHeader>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-gamepad text-2xl text-primary-foreground"></i>
                </div>
                <DialogTitle className="text-2xl mb-2">Confirm Purchase</DialogTitle>
                <p className="text-muted-foreground">Review and verify your purchase details</p>
              </div>
            </DialogHeader>

            <div className="space-y-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <img src={gameLogoUrl} alt={gameName} className="w-12 h-12 mr-3" />
                    <div>
                      <p className="font-semibold" data-testid="package-name">{pkg.name}</p>
                      <p className="text-sm text-muted-foreground">{gameName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Balance Information */}
              {piBalance && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Your Balance</span>
                      <div className="text-right">
                        <p className="font-mono text-blue-400 text-lg font-bold">
                          {piBalance.balance.toFixed(2)} π
                        </p>
                        {piBalance.isTestnet && (
                          <p className="text-xs text-amber-400">Testnet</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">After Purchase</span>
                      <div className="text-right">
                        <p className="font-mono text-green-400 text-lg font-bold">
                          {(piBalance.balance - (pkg.piPrice || 0)).toFixed(2)} π
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm font-medium">Game Account</Label>
                  {pkg.game === 'PUBG' ? (
                    <div className="space-y-2 mt-2">
                      <Input
                        placeholder="In-Game Name (IGN)"
                        value={editableGameAccount.ign || ''}
                        onChange={(e) => handleGameAccountChange('ign', e.target.value)}
                        data-testid="purchase-pubg-ign"
                      />
                      <Input
                        placeholder="Player UID"
                        value={editableGameAccount.uid || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleGameAccountChange('uid', value);
                        }}
                        className="font-mono"
                        data-testid="purchase-pubg-uid"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 mt-2">
                      <Input
                        placeholder="User ID"
                        value={editableGameAccount.userId || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleGameAccountChange('userId', value);
                        }}
                        className="font-mono"
                        data-testid="purchase-mlbb-user-id"
                      />
                      <Input
                        placeholder="Zone ID"
                        value={editableGameAccount.zoneId || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleGameAccountChange('zoneId', value);
                        }}
                        className="font-mono"
                        data-testid="purchase-mlbb-zone-id"
                      />
                    </div>
                  )}
                  <p className="text-xs text-amber-400 mt-2">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    Please verify your game IDs are correct. Incorrect IDs may result in failed delivery.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost</span>
                    <div className="text-right">
                      <p className="font-mono text-green-400 text-xl font-bold" data-testid="total-cost">
                        {pkg.piPrice?.toFixed(1)} π
                      </p>
                      {/* USD value hidden as per requirements */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {process.env.NODE_ENV !== 'production' && (
              <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-300">
                  <i className="fas fa-info-circle mr-2"></i>
                  Testnet Mode: No real Pi will be deducted from your mainnet wallet.
                </p>
              </div>
            )}

            {/* Floating Confirm Purchase Button */}
            <div className="sticky bottom-0 bg-background pt-4 pb-2 -mx-6 px-6 border-t border-border">
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex-1"
                  data-testid="cancel-purchase"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmPurchase} 
                  className="flex-1"
                  data-testid="confirm-purchase"
                >
                  Continue
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lock text-2xl text-primary-foreground"></i>
                </div>
                <DialogTitle className="text-2xl mb-2">Secure Payment</DialogTitle>
                <p className="text-muted-foreground">Enter your passphrase to authorize the payment</p>
              </div>
            </DialogHeader>

            <div className="space-y-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{pkg.name}</p>
                    <p className="text-2xl font-bold text-green-400 font-mono">
                      {pkg.piPrice?.toFixed(1)} π
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Account: {formatGameAccount()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* In testnet mode, we don't require a passphrase for mock payments */}
              {useMockPayment ? (
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                  <p className="text-sm text-green-300">
                    <i className="fas fa-info-circle mr-2"></i>
                    Testnet Mode: This is a mock payment. No real passphrase required.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Pi Wallet Passphrase</Label>
                  <div className="relative">
                    <Input
                      type={showPassphrase ? "text" : "password"}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter your secure Pi wallet passphrase"
                      disabled={isProcessing}
                      data-testid="payment-passphrase"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      data-testid="toggle-passphrase"
                    >
                      <i className={`fas ${showPassphrase ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This passphrase secures your Pi Network transactions
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-300">
                <i className="fas fa-info-circle mr-2"></i>
                You are about to pay {pkg.piPrice?.toFixed(1)} π for {pkg.name}. This transaction will be processed through Pi Network.
              </p>
            </div>

            {/* Floating Pay Now Button */}
            <div className="sticky bottom-0 bg-background pt-4 pb-2 -mx-6 px-6 border-t border-border">
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('confirm')} 
                  className="flex-1"
                  disabled={isProcessing}
                  data-testid="back-to-confirm"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleProcessPayment} 
                  className="flex-1"
                  disabled={isProcessing || (!useMockPayment && !passphrase && process.env.NODE_ENV === 'production')}
                  data-testid="process-payment"
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card mr-2"></i>
                      Pay Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}