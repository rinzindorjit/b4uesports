import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="refund-policy-page">
      <ParticleBackground />
      <Navigation isTestnet={import.meta.env.DEV} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Important Notice
          </h2>
          <p className="text-red-300">
            <strong>All sales of digital in-game currency are final and non-refundable.</strong> 
            Please read this policy carefully before making any purchases.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. No Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>B4U Esports operates a strict no-refund policy for all digital gaming currency purchases. This includes:</p>
              <ul>
                <li>PUBG Mobile UC (Unknown Cash)</li>
                <li>Mobile Legends: Bang Bang Diamonds</li>
                <li>All other in-game currencies offered on our platform</li>
              </ul>
              <p><strong>Once a transaction is completed and gaming currency is delivered to your account, the sale is final.</strong></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Reasons for No-Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>Our no-refund policy exists for several important reasons:</p>
              <ul>
                <li><strong>Digital Nature:</strong> Gaming currencies are digital goods that cannot be "returned" once delivered</li>
                <li><strong>Instant Delivery:</strong> Currency is delivered immediately to your game account</li>
                <li><strong>Fraud Prevention:</strong> Protects against fraudulent refund claims and chargebacks</li>
                <li><strong>Publisher Requirements:</strong> Game publishers do not allow reversal of currency transactions</li>
                <li><strong>Pi Network Integration:</strong> Cryptocurrency transactions are designed to be irreversible</li>
                <li><strong>Operational Costs:</strong> Processing refunds would require significant additional resources</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pre-Purchase Verification</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>To avoid issues, please verify the following before completing your purchase:</p>
              <ul>
                <li><strong>Game Account Information:</strong> Ensure your PUBG UID or Mobile Legends User ID/Zone ID are correct</li>
                <li><strong>Package Selection:</strong> Verify you are purchasing the correct game and currency amount</li>
                <li><strong>Payment Amount:</strong> Confirm the Pi amount and USD equivalent before proceeding</li>
                <li><strong>Account Access:</strong> Ensure you have access to the game account where currency will be delivered</li>
                <li><strong>Game Version:</strong> Verify you are playing the correct version of the game (Global, regional, etc.)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Exceptional Circumstances</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>While our general policy is no refunds, we may consider exceptions in very limited circumstances:</p>
              <ul>
                <li><strong>Technical Failure:</strong> If our system fails to deliver currency due to a technical error on our end</li>
                <li><strong>Wrong Currency Type:</strong> If we deliver the wrong type of currency due to a system error</li>
                <li><strong>Duplicate Charges:</strong> If you are accidentally charged multiple times for the same purchase</li>
                <li><strong>Service Outage:</strong> If our service is down but we still process your payment</li>
              </ul>
              <p><strong>Note:</strong> Exceptions require investigation and may take 5-10 business days to resolve.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. What is NOT Eligible for Refund</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>The following situations are NOT eligible for refunds:</p>
              <ul>
                <li>Change of mind after purchase</li>
                <li>Incorrect game account information provided by user</li>
                <li>Loss of game account access after currency delivery</li>
                <li>Game account suspension or ban by game publishers</li>
                <li>Fluctuations in Pi cryptocurrency value</li>
                <li>User dissatisfaction with the purchased game</li>
                <li>Technical issues with the game itself (not our service)</li>
                <li>Forgetting about automatic purchases or subscriptions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Delivery Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>While we maintain a no-refund policy, we guarantee delivery of your purchased gaming currency:</p>
              <ul>
                <li><strong>Delivery Time:</strong> Currency is typically delivered within 5-10 minutes</li>
                <li><strong>Delivery Confirmation:</strong> You will receive email confirmation when currency is delivered</li>
                <li><strong>Support Assistance:</strong> If delivery is delayed, contact our support team immediately</li>
                <li><strong>Tracking:</strong> All transactions are tracked and can be verified</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Dispute Resolution Process</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>If you believe you qualify for an exception to our no-refund policy:</p>
              <ol>
                <li><strong>Contact Support:</strong> Email us at info@b4uesports.com within 24 hours of purchase</li>
                <li><strong>Provide Information:</strong> Include your transaction ID, Pi payment ID, and detailed explanation</li>
                <li><strong>Investigation:</strong> Our team will investigate your claim within 48 hours</li>
                <li><strong>Documentation:</strong> Provide any requested screenshots or additional information</li>
                <li><strong>Decision:</strong> We will provide a final decision within 5 business days</li>
                <li><strong>Resolution:</strong> If approved, resolution will be completed within 7 business days</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Chargeback Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>Due to the nature of cryptocurrency transactions through Pi Network:</p>
              <ul>
                <li>Traditional credit card chargebacks are not applicable</li>
                <li>Pi Network transactions are irreversible by design</li>
                <li>Disputes must be resolved through our support system</li>
                <li>We do not process payment reversals through Pi Network</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Customer Support</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>For assistance with purchases or delivery issues:</p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p><strong>B4U Esports Support</strong></p>
                <p>Email: <a href="mailto:info@b4uesports.com" className="text-primary">info@b4uesports.com</a></p>
                <p>Phone: <a href="tel:+97517875099" className="text-primary">+975 17875099</a></p>
                <p>Response Time: Within 24 hours</p>
                <p>Available: 24/7 for urgent delivery issues</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Policy Updates</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We may update this Refund Policy to reflect changes in our services or legal requirements. Updates will be:</p>
              <ul>
                <li>Posted on our website with updated date</li>
                <li>Communicated to users via email</li>
                <li>Effective immediately upon posting</li>
                <li>Applied to future transactions only</li>
              </ul>
              <p>Your continued use of our services constitutes acceptance of any policy changes.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Legal Framework</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>This Refund Policy is governed by:</p>
              <ul>
                <li>Laws of Bhutan regarding digital commerce</li>
                <li>International best practices for digital goods</li>
                <li>Pi Network's terms and conditions</li>
                <li>Game publishers' policies and requirements</li>
              </ul>
              <p>This policy is designed to be fair while protecting the integrity of digital currency transactions.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
