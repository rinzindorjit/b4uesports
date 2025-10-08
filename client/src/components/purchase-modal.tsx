import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePiNetwork } from '@/hooks/use-pi-network';
import { GAME_LOGOS } from '@/lib/constants';
import type { Package } from '@/types/pi-network';
import bcrypt from 'bcryptjs';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
}

export default function PurchaseModal({ isOpen, onClose, package: pkg }: PurchaseModalProps) {
  const { user, createPayment } = usePiNetwork();
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
    if (!passphrase) {
      toast({
        title: "Error",
        description: "Please enter your passphrase",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment with Pi Network
      const paymentData = {
        amount: pkg.piPrice || 0,
        memo: `${pkg.name} - ${gameName}`,
        metadata: {
          type: 'backend' as const,
          userId: user!.id,
          packageId: pkg.id,
          gameAccount: editableGameAccount,
          passphrase: await bcrypt.hash(passphrase, 10), // Hash passphrase
        },
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
            description: `Transaction confirmed on Testnet! Transaction ID: ${txid}`,
          });
          onClose();
          setStep('confirm');
          setPassphrase('');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto" data-testid="purchase-modal">
        {step === 'confirm' ? (
          <>
            <DialogHeader>
              <div className="text-center mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-gamepad text-xl md:text-2xl text-primary-foreground"></i>
                </div>
                <DialogTitle className="text-xl md:text-2xl mb-2">Confirm Purchase</DialogTitle>
                <p className="text-muted-foreground text-sm md:text-base">Review and verify your purchase details</p>
              </div>
            </DialogHeader>

            <div className="space-y-4 mb-6">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center">
                    <img src={gameLogoUrl} alt={gameName} className="w-10 h-10 md:w-12 md:h-12 mr-2 md:mr-3" />
                    <div>
                      <p className="font-semibold text-sm md:text-base" data-testid="package-name">{pkg.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{gameName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <Label className="text-sm font-medium">Game Account</Label>
                  {pkg.game === 'PUBG' ? (
                    <div className="space-y-2 mt-2">
                      <Input
                        placeholder="In-Game Name (IGN)"
                        value={editableGameAccount.ign || ''}
                        onChange={(e) => handleGameAccountChange('ign', e.target.value)}
                        className="text-sm"
                        data-testid="purchase-pubg-ign"
                      />
                      <Input
                        placeholder="Player UID"
                        value={editableGameAccount.uid || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleGameAccountChange('uid', value);
                        }}
                        className="font-mono text-sm"
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
                        className="font-mono text-sm"
                        data-testid="purchase-mlbb-user-id"
                      />
                      <Input
                        placeholder="Zone ID"
                        value={editableGameAccount.zoneId || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleGameAccountChange('zoneId', value);
                        }}
                        className="font-mono text-sm"
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
                <CardContent className="p-3 md:p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm md:text-base">Total Cost</span>
                    <div className="text-right">
                      <p className="font-mono text-green-400 text-lg md:text-xl font-bold" data-testid="total-cost">
                        {pkg.piPrice?.toFixed(1)} π
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {import.meta.env.DEV && (
              <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-3 md:p-4 mb-6">
                <p className="text-xs md:text-sm text-amber-300">
                  <i className="fas fa-info-circle mr-2"></i>
                  🚧 TESTNET MODE: No real Pi will be deducted from your mainnet wallet.
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 text-sm md:text-base"
                data-testid="cancel-purchase"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmPurchase} 
                className="flex-1 text-sm md:text-base"
                data-testid="confirm-purchase"
              >
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="text-center mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lock text-xl md:text-2xl text-primary-foreground"></i>
                </div>
                <DialogTitle className="text-xl md:text-2xl mb-2">Secure Payment</DialogTitle>
                <p className="text-muted-foreground text-sm md:text-base">Enter your passphrase to authorize the payment</p>
              </div>
            </DialogHeader>

            <div className="space-y-4 mb-6">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="text-center">
                    <p className="font-semibold text-sm md:text-base">{pkg.name}</p>
                    <p className="text-lg md:text-2xl font-bold text-green-400 font-mono">
                      {pkg.piPrice?.toFixed(1)} π
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Account: {formatGameAccount()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label className="text-sm">Payment Passphrase</Label>
                <div className="relative">
                  <Input
                    type={showPassphrase ? "text" : "password"}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter your secure passphrase"
                    disabled={isProcessing}
                    className="text-sm"
                    data-testid="payment-passphrase"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    data-testid="toggle-passphrase"
                  >
                    <i className={`fas ${showPassphrase ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This passphrase secures your Pi Network transactions
                </p>
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 md:p-4 mb-6">
              <p className="text-xs md:text-sm text-blue-300">
                <i className="fas fa-info-circle mr-2"></i>
                🚧 TESTNET TRANSACTION: You are about to pay {pkg.piPrice?.toFixed(1)} π for {pkg.name}. No real Pi will be deducted.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setStep('confirm')} 
                className="flex-1 text-sm md:text-base"
                disabled={isProcessing}
                data-testid="back-to-confirm"
              >
                Back
              </Button>
              <Button 
                onClick={handleProcessPayment} 
                className="flex-1 text-sm md:text-base"
                disabled={isProcessing || !passphrase}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
