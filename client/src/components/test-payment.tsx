import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { processPayment, verifyPayment } from '@/lib/payment-process';
import { useToast } from '@/hooks/use-toast';

export default function TestPayment() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handleTestPayment = async () => {
    setIsProcessing(true);
    try {
      // Test payment process with a small amount
      const result = await processPayment(
        1.0, 
        'Test Payment for B4U Esports',
        {
          test: true,
          timestamp: new Date().toISOString(),
          purpose: 'integration-testing'
        }
      );
      
      if (result.success) {
        toast({
          title: "Payment Successful",
          description: `Payment ID: ${result.paymentId}`,
        });
        
        // Store payment ID for verification
        setPaymentId(result.paymentId || null);
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Payment processing failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentId) {
      toast({
        title: "Error",
        description: "No payment ID to verify",
        variant: "destructive",
      });
      return;
    }

    try {
      const verification = await verifyPayment(paymentId);
      setVerificationResult(verification);
      
      if (verification.verified) {
        toast({
          title: "Payment Verified",
          description: "Payment has been successfully verified with Pi Network",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: verification.error || "Payment verification failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Payment Flow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This component tests the complete payment flow integration with Pi Network.
        </p>
        
        <Button 
          onClick={handleTestPayment} 
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <span className="mr-2">Processing...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : (
            'Test Payment Process (1 π)'
          )}
        </Button>
        
        {paymentId && (
          <Button 
            onClick={handleVerifyPayment} 
            className="w-full"
          >
            Verify Payment
          </Button>
        )}
        
        {verificationResult && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Verification Result:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(verificationResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}