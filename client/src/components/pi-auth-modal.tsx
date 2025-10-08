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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('consent');
      setError(null);
    }
  }, [isOpen]);

  const handleAuthenticate = async () => {
    setStep('processing');
    setError(null);
    try {
      await onAuthenticate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStep('consent'); // Return to consent step on error
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-md w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto mobile-popup responsive-modal" data-testid="pi-auth-modal">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-center">
            {step === 'consent' ? 'Connect with Pi Network' : 'Connecting...'}
          </DialogTitle>
        </DialogHeader>

        {step === 'consent' ? (
          <div className="space-y-4 mobile-content">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <img 
                  src={BRAND_LOGOS.PI} 
                  alt="Pi Network" 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                />
              </div>
              <p className="text-muted-foreground text-xs md:text-sm">
                B4U Esports would like to access your Pi Network account
              </p>
            </div>

            <Card className="p-3">
              <CardContent className="p-0">
                <h3 className="font-semibold text-sm mb-2">Permissions requested:</h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-1 mt-0.5 text-xs"></i>
                    <span>Access your username</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-1 mt-0.5 text-xs"></i>
                    <span>Process payments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-2">
              <p className="text-xs text-amber-300">
                <i className="fas fa-info-circle mr-1"></i>
                <strong>Important:</strong> Use Pi Browser app. Check for notification banners.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-2">
                <p className="text-xs text-red-300">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  {error}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="w-full text-xs md:text-sm h-8"
                data-testid="auth-cancel"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAuthenticate} 
                className="w-full text-xs md:text-sm h-8"
                data-testid="auth-approve"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-1"></i> Connect
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 mobile-content">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-spinner fa-spin text-xl text-primary-foreground"></i>
            </div>
            <p className="text-base font-semibold mb-2">Connecting to Pi Network</p>
            <p className="text-muted-foreground text-xs mb-4">Check your Pi Browser for request...</p>
            
            <div className="space-y-2 text-left mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-xs text-blue-300">
                  <i className="fas fa-mobile-alt mr-1"></i>
                  <strong>Mobile:</strong> Look for notification banner at the top of your screen.
                </p>
              </div>
              
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p className="text-xs text-amber-300">
                  <i className="fas fa-sync mr-1"></i>
                  <strong>No prompt?</strong> Refresh or restart Pi Browser.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('consent');
                  setError('Authentication cancelled. Please try again.');
                }} 
                className="w-full text-xs h-8"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}