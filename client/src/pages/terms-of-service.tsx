import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="terms-of-service-page">
      <ParticleBackground />
      <Navigation isTestnet={import.meta.env.DEV} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>By accessing and using B4U Esports services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services. Your continued use of our platform constitutes acceptance of any updates or modifications to these terms.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>B4U Esports provides a digital marketplace for purchasing in-game currencies using Pi Network's cryptocurrency. Our services include:</p>
              <ul>
                <li>Purchase of PUBG Mobile UC (Unknown Cash)</li>
                <li>Purchase of Mobile Legends: Bang Bang Diamonds</li>
                <li>Pi Network payment integration</li>
                <li>Real-time pricing and currency conversion</li>
                <li>Transaction history and account management</li>
                <li>Customer support services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Account Registration</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>To use our services, you must:</p>
              <ul>
                <li>Have a valid Pi Network account</li>
                <li>Be at least 13 years old (or the minimum age in your jurisdiction)</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Pi Network Integration</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>Our platform integrates with Pi Network for authentication and payments:</p>
              <ul>
                <li><strong>Testnet Mode:</strong> During development, transactions use Pi Testnet tokens with no real value</li>
                <li><strong>Mainnet Mode:</strong> Production transactions use real Pi cryptocurrency</li>
                <li><strong>Authentication:</strong> We verify your identity through Pi Network's secure systems</li>
                <li><strong>Payment Processing:</strong> All transactions are processed through Pi Network's infrastructure</li>
                <li><strong>Security:</strong> We implement Pi Network's recommended security practices</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Purchasing Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>When making purchases through our platform:</p>
              <ul>
                <li><strong>Pricing:</strong> All prices are displayed in Pi cryptocurrency with USD equivalents</li>
                <li><strong>Payment:</strong> Payments are processed immediately upon confirmation</li>
                <li><strong>Delivery:</strong> Gaming currency is delivered to your specified game account within 5-10 minutes</li>
                <li><strong>Verification:</strong> You must provide accurate game account information</li>
                <li><strong>Confirmation:</strong> You will receive email confirmation of all purchases</li>
                <li><strong>Support:</strong> Contact us immediately if delivery fails or is delayed</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>As a user of our services, you agree to:</p>
              <ul>
                <li>Provide accurate game account information</li>
                <li>Use the service only for legitimate gaming purposes</li>
                <li>Not attempt to circumvent our security measures</li>
                <li>Not use the service for any illegal activities</li>
                <li>Respect intellectual property rights</li>
                <li>Not interfere with other users' access to the service</li>
                <li>Comply with applicable laws and regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Prohibited Activities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>The following activities are strictly prohibited:</p>
              <ul>
                <li>Fraudulent transactions or payment reversals</li>
                <li>Using stolen or unauthorized payment methods</li>
                <li>Creating multiple accounts to abuse promotions</li>
                <li>Attempting to hack or compromise our systems</li>
                <li>Reselling purchased gaming currency</li>
                <li>Using automated tools or bots</li>
                <li>Violating game publishers' terms of service</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>All content on our platform is protected by intellectual property laws:</p>
              <ul>
                <li><strong>B4U Esports:</strong> Our brand, logo, and platform design are our property</li>
                <li><strong>Game Content:</strong> PUBG Mobile and Mobile Legends content belongs to their respective publishers</li>
                <li><strong>Pi Network:</strong> Pi Network logos and branding are used with permission</li>
                <li><strong>User Content:</strong> You retain rights to your personal information and account data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>Our services are provided "as is" without warranties:</p>
              <ul>
                <li><strong>Service Availability:</strong> We do not guarantee uninterrupted service</li>
                <li><strong>Game Integration:</strong> We are not responsible for changes to game publishers' systems</li>
                <li><strong>Pi Network:</strong> We are not responsible for Pi Network technical issues</li>
                <li><strong>Market Fluctuations:</strong> Pi currency values may fluctuate</li>
                <li><strong>Third-Party Services:</strong> We are not liable for third-party service failures</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>To the maximum extent permitted by law, B4U Esports shall not be liable for:</p>
              <ul>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages exceeding the amount paid for services</li>
                <li>Issues arising from user error or negligence</li>
                <li>Third-party actions or service interruptions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We may terminate or suspend your account for:</p>
              <ul>
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or suspicious activity</li>
                <li>Repeated customer service issues</li>
                <li>Legal requirements or safety concerns</li>
              </ul>
              <p>Upon termination, your access to services will cease, but completed transactions remain valid.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>These Terms of Service are governed by the laws of Bhutan. Any disputes will be resolved through:</p>
              <ul>
                <li>Good faith negotiation</li>
                <li>Mediation if necessary</li>
                <li>Arbitration in Thimphu, Bhutan</li>
                <li>Courts of competent jurisdiction in Bhutan</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>For questions about these Terms of Service, contact us:</p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p><strong>B4U Esports</strong></p>
                <p>Email: <a href="mailto:info@b4uesports.com" className="text-primary">info@b4uesports.com</a></p>
                <p>Phone: <a href="tel:+97517875099" className="text-primary">+975 17875099</a></p>
                <p>We will respond to all inquiries within 48 hours.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
