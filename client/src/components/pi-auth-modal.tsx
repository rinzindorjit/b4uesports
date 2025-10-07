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
    onAuthenticate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-md w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto" data-testid="pi-auth-modal">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-center">
            {step === 'consent' ? 'Connect with Pi Network' : 'Connecting...'}
          </DialogTitle>
        </DialogHeader>

        {step === 'consent' ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <img 
                  src={BRAND_LOGOS.PI} 
                  alt="Pi Network" 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                />
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                B4U Esports would like to access your Pi Network account
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Permissions requested:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>Access your username for personalization</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>Process payments for purchases</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>Access your wallet address</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-4">
              <p className="text-xs md:text-sm text-amber-300">
                <i className="fas fa-info-circle mr-2"></i>
                Note: Transactions are currently processed on the Pi Testnet. No real Pi coins will be deducted.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="w-full text-sm md:text-base"
                data-testid="auth-cancel"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAuthenticate} 
                className="w-full text-sm md:text-base"
                data-testid="auth-approve"
                disabled={isLoading}
              >
                Approve
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-spinner fa-spin text-2xl text-primary-foreground"></i>
            </div>
            <p className="text-lg font-semibold mb-3">Connecting to Pi Network</p>
            <p className="text-muted-foreground text-sm md:text-base mb-6">Please check your Pi Browser for authentication request...</p>
            
            <div className="space-y-4 text-left">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-xs text-blue-300">
                  <i className="fas fa-mobile-alt mr-2"></i>
                  <strong>Mobile Users:</strong> Look for a notification banner in your Pi Browser asking for authentication approval.
                </p>
              </div>
              
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p className="text-xs text-amber-300">
                  <i className="fas fa-sync mr-2"></i>
                  <strong>Not seeing a prompt?</strong> Try refreshing the page or restarting the Pi Browser app.
                </p>
              </div>
              
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-xs text-red-300">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <strong>Still having issues?</strong> Make sure you're using the official Pi Browser app.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}