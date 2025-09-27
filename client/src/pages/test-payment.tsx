import { PiNetworkProvider } from '@/hooks/use-pi-network';
import TestPayment from '@/components/test-payment';
import { Toaster } from '@/components/ui/toaster';

export default function TestPaymentPage() {
  return (
    <PiNetworkProvider>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-3xl font-bold text-center mb-8">Payment Integration Test</h1>
          <TestPayment />
        </div>
        <Toaster />
      </div>
    </PiNetworkProvider>
  );
}