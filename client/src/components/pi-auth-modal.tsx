import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BRAND_LOGOS } from '@/lib/constants';

interface PiAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: () => void;
  isLoading: boolean;
}

export default function PiAuthModal({ isOpen, onClose, onAuthenticate, isLoading }: PiAuthModalProps) {
  const [step, setStep] = useState<'consent' | 'processing'>('consent');

  useEffect(() => {
    if (isOpen) {
      setStep('consent');
    }
  }, [isOpen]);

  const handleAuthenticate = async () => {
    setStep('processing');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    onAuthenticate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="pi-auth-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {step === 'consent' ? 'Connect with Pi Network' : 'Processing...'}
          </DialogTitle>
        </DialogHeader>

        {step === 'consent' ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <img 
                  src={BRAND_LOGOS.PI} 
                  alt="Pi Network" 
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <p className="text-muted-foreground">
                B4U Esports would like to access your Pi Network account
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Permissions requested:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    View your Pi Network username
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Process payments for purchases
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Access your wallet address
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-4">
              <p className="text-sm text-amber-300">
                <i className="fas fa-info-circle mr-2"></i>
                Note: Transactions are currently processed on the Pi Testnet. No real Pi coins will be deducted.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
                data-testid="auth-cancel"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAuthenticate} 
                className="flex-1"
                data-testid="auth-approve"
              >
                Approve
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-spinner fa-spin text-2xl text-primary-foreground"></i>
            </div>
            <p className="text-lg font-semibold mb-2">Connecting to Pi Network</p>
            <p className="text-muted-foreground">Please wait while we authenticate your account...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}