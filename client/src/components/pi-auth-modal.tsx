import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
      <DialogContent className="max-w-md w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto" data-testid="pi-auth-modal">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-center">
            {step === 'consent' ? 'Connect with Pi Network' : 'Connecting...'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Connect your Pi Network account to access B4U Esports services and make purchases.
          </DialogDescription>
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
                <strong>Important:</strong> Please use the Pi Browser app for authentication. On mobile, check for notification banners during authentication. If you don't see a prompt, try refreshing the page or restarting the Pi Browser app.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                <p className="text-xs md:text-sm text-red-300">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {error}
                </p>
              </div>
            )}

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
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Connecting...
                  </>
                ) : (
                  'Approve'
                )}
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
            
            <div className="space-y-4 text-left mb-6">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p className="text-xs text-amber-300">
                  <i className="fas fa-sync mr-2"></i>
                  <strong>Not seeing a prompt?</strong> Try these steps:
                </p>
                <ul className="list-disc list-inside mt-1 ml-2 text-xs text-amber-300 space-y-1">
                  <li>Refresh the page</li>
                  <li>Restart the Pi Browser app</li>
                  <li>Check your internet connection</li>
                  <li>Make sure you're using the official Pi Browser app</li>
                </ul>
              </div>
              
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-xs text-red-300">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <strong>Still having issues?</strong> Authentication may take up to 3 minutes on mobile networks. If problems persist, try again later or contact support.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('consent');
                  setError('Authentication cancelled by user. Please try again.');
                }} 
                className="w-full"
                disabled={isLoading}
              >
                Cancel Authentication
              </Button>
              
              <Button 
                onClick={handleAuthenticate} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Retry Authentication
                  </>
                ) : (
                  'Retry Authentication'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}