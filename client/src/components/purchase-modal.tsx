import { useState, useEffect } from 'react';
import { usePiNetwork } from '@/hooks/use-pi-network';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GAME_LOGOS } from '@/lib/constants';
import type { Package, PaymentData } from '@/types/pi-network';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
}

export default function PurchaseModal({ isOpen, onClose, package: pkg }: PurchaseModalProps) {
  const { user, createPayment } = usePiNetwork();
  const { toast } = useToast();
  const [step, setStep] = useState<'confirm' | 'passphrase' | 'processing'>('confirm');
  const [passphrase, setPassphrase] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameAccount, setGameAccount] = useState({
    ign: '',
    uid: '',
    userId: '',
    zoneId: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setPassphrase('');
      setIsProcessing(false);
      
      // Pre-fill game account info if available
      if (user?.gameAccounts) {
        if (pkg.game === 'PUBG' && user.gameAccounts.pubg) {
          setGameAccount({
            ...gameAccount,
            ign: user.gameAccounts.pubg.ign,
            uid: user.gameAccounts.pubg.uid,
          });
        } else if (pkg.game === 'MLBB' && user.gameAccounts.mlbb) {
          setGameAccount({
            ...gameAccount,
            userId: user.gameAccounts.mlbb.userId,
            zoneId: user.gameAccounts.mlbb.zoneId,
          });
        }
      }
    }
  }, [isOpen, user, pkg.game]);

  const handleConfirmPurchase = () => {
    // Validate game account info
    if (pkg.game === 'PUBG') {
      if (!gameAccount.ign || !gameAccount.uid) {
        toast({
          title: "Missing Information",
          description: "Please enter your PUBG IGN and UID.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate UID is numeric
      if (!/^\d+$/.test(gameAccount.uid)) {
        toast({
          title: "Invalid UID",
          description: "PUBG UID must be numeric.",
          variant: "destructive",
        });
        return;
      }
    } else if (pkg.game === 'MLBB') {
      if (!gameAccount.userId || !gameAccount.zoneId) {
        toast({
          title: "Missing Information",
          description: "Please enter your MLBB User ID and Zone ID.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate IDs are numeric
      if (!/^\d+$/.test(gameAccount.userId) || !/^\d+$/.test(gameAccount.zoneId)) {
        toast({
          title: "Invalid IDs",
          description: "MLBB User ID and Zone ID must be numeric.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setStep('passphrase');
  };

  const handleProcessPayment = async () => {
    if (!passphrase) {
      toast({
        title: "Passphrase Required",
        description: "Please enter your passphrase to confirm the purchase.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, you would validate the passphrase against the stored hash
    // For now, we'll just proceed with the payment
    
    setIsProcessing(true);
    
    try {
      // Create payment data
      const paymentData: PaymentData = {
        amount: pkg.piPrice || 0,
        memo: `${pkg.name} for ${pkg.game}`,
        metadata: {
          type: 'backend',
          userId: user?.id || '',
          packageId: pkg.id,
          gameAccount: { ...gameAccount },
        },
      };
      
      // Create payment with callbacks
      createPayment(paymentData, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('Payment approved by server:', paymentId);
          toast({
            title: "Payment Approved",
            description: "Your payment has been approved by our server.",
          });
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log('Payment completed:', paymentId, txid);
          toast({
            title: "✅ Payment Completed",
            description: "Your purchase was successful! Transaction ID: " + txid,
          });
          
          // Trigger real-time update
          window.dispatchEvent(new CustomEvent('paymentCompleted'));
          
          // Close modal after a short delay
          setTimeout(() => {
            setIsProcessing(false);
            onClose();
          }, 2000);
        },
        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          toast({
            title: "Payment Cancelled",
            description: "Your payment was cancelled. No Pi was deducted.",
          });
          setIsProcessing(false);
        },
        onError: (error: Error) => {
          console.error('Payment error:', error);
          toast({
            title: "Payment Failed",
            description: error.message || "An error occurred during payment processing.",
            variant: "destructive",
          });
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.error('Payment creation failed:', error);
      toast({
        title: "Payment Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create payment.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleGameAccountChange = (field: string, value: string) => {
    setGameAccount({
      ...gameAccount,
      [field]: value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'confirm' && 'Confirm Purchase'}
            {step === 'passphrase' && 'Enter Passphrase'}
            {step === 'processing' && 'Processing Payment'}
          </DialogTitle>
        </DialogHeader>
        
        {step === 'confirm' && (
          <>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src={pkg.game === 'PUBG' ? GAME_LOGOS.PUBG : GAME_LOGOS.MLBB} 
                  alt={pkg.game} 
                  className="w-16 h-16 mr-4 rounded-lg"
                />
                <div className="text-left">
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <p className="text-muted-foreground">{pkg.game}</p>
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <p className="text-2xl font-bold text-primary">
                  {pkg.piPrice?.toFixed(2)} π
                </p>
              </div>
              
              <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-300">
                  <i className="fas fa-info-circle mr-2"></i>
                  🚧 TESTNET TRANSACTION: You are about to pay {pkg.piPrice?.toFixed(1)} π for {pkg.name}. No real Pi will be deducted.
                </p>
              </div>
            </div>
            
            {/* Game Account Information */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Game Account Information</h4>
              
              {pkg.game === 'PUBG' ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="ign">PUBG IGN</Label>
                    <Input
                      id="ign"
                      value={gameAccount.ign}
                      onChange={(e) => handleGameAccountChange('ign', e.target.value)}
                      placeholder="Your in-game name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="uid">PUBG UID</Label>
                    <Input
                      id="uid"
                      value={gameAccount.uid}
                      onChange={(e) => handleGameAccountChange('uid', e.target.value)}
                      placeholder="Your UID (numbers only)"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="userId">MLBB User ID</Label>
                    <Input
                      id="userId"
                      value={gameAccount.userId}
                      onChange={(e) => handleGameAccountChange('userId', e.target.value)}
                      placeholder="Your User ID (numbers only)"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zoneId">MLBB Zone ID</Label>
                    <Input
                      id="zoneId"
                      value={gameAccount.zoneId}
                      onChange={(e) => handleGameAccountChange('zoneId', e.target.value)}
                      placeholder="Your Zone ID (numbers only)"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                </div>
              )}
            </div>
            
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
                Confirm
              </Button>
            </div>
          </>
        )}
        
        {step === 'passphrase' && (
          <>
            <div className="text-center mb-6">
              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <p className="text-2xl font-bold text-primary">
                  {pkg.piPrice?.toFixed(2)} π
                </p>
                <p className="text-sm text-muted-foreground">
                  {pkg.name} for {pkg.game}
                </p>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Enter your passphrase to confirm this purchase
              </p>
              
              <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-300">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  This is a TESTNET transaction. No real Pi coins will be deducted.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter your passphrase"
                disabled={isProcessing}
              />
            </div>
            
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