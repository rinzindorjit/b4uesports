import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function UserAgreement() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="user-agreement-page">
      <ParticleBackground />
      <Navigation isTestnet={import.meta.env.DEV} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-times mr-2"></i>
            Close
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">User Agreement</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Agreement Overview</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>This User Agreement ("Agreement") is a legally binding contract between you ("User") and B4U Esports ("Company," "we," "us," or "our"). By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions contained in this Agreement.</p>
              <p>This Agreement governs your access to and use of our Pi Network-integrated gaming marketplace platform, including all features, content, and services offered through our website and applications.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. User Eligibility and Account Creation</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>To use our services, you must:</p>
              <ul>
                <li><strong>Age Requirements:</strong> Be at least 13 years old, or the minimum age in your jurisdiction</li>
                <li><strong>Pi Network Account:</strong> Have a valid, active Pi Network account in good standing</li>
                <li><strong>Legal Capacity:</strong> Have the legal capacity to enter into binding agreements</li>
                <li><strong>Accurate Information:</strong> Provide truthful, accurate, and complete information</li>
                <li><strong>Compliance:</strong> Comply with all applicable laws and regulations</li>
                <li><strong>Single Account:</strong> Maintain only one account per person</li>
              </ul>
              <p>We reserve the right to verify your identity and eligibility at any time.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Obligations and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>As a user of our platform, you agree to:</p>
              <h4>Account Security:</h4>
              <ul>
                <li>Maintain the confidentiality of your login credentials</li>
                <li>Use strong, unique passwords for your accounts</li>
                <li>Enable two-factor authentication when available</li>
                <li>Immediately notify us of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
              <h4>Lawful Use:</h4>
              <ul>
                <li>Use our services only for legitimate gaming purposes</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Not engage in any fraudulent or deceptive practices</li>
                <li>Not use our services for money laundering or illegal activities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Game Account Verification and Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>You are solely responsible for providing accurate game account information:</p>
              <ul>
                <li><strong>PUBG Mobile:</strong> Correct IGN (In-Game Name) and UID (User ID)</li>
                <li><strong>Mobile Legends:</strong> Accurate User ID and Zone ID</li>
                <li><strong>Verification:</strong> Double-check all information before confirming purchases</li>
                <li><strong>Updates:</strong> Keep your game account information current in your profile</li>
                <li><strong>Consequences:</strong> Incorrect information may result in failed delivery or loss of purchase</li>
                <li><strong>No Refunds:</strong> We are not responsible for delivery failures due to incorrect user-provided information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Payment Terms and Pi Network Integration</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>Our payment system is integrated with Pi Network:</p>
              <h4>Payment Processing:</h4>
              <ul>
                <li>All payments are processed through Pi Network's secure infrastructure</li>
                <li>Transactions are recorded on the Pi blockchain</li>
                <li>Payment confirmation is required before service delivery</li>
                <li>Real-time pricing reflects current Pi/USD exchange rates</li>
              </ul>
              <h4>User Responsibilities:</h4>
              <ul>
                <li>Ensure sufficient Pi balance before making purchases</li>
                <li>Verify transaction details before confirming payment</li>
                <li>Understand that blockchain transactions are irreversible</li>
                <li>Accept current market pricing at the time of purchase</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Service Availability and Performance</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We strive to provide reliable service, but you acknowledge:</p>
              <ul>
                <li><strong>Availability:</strong> Services may be temporarily unavailable due to maintenance or technical issues</li>
                <li><strong>Performance:</strong> Service speed and reliability may vary based on network conditions</li>
                <li><strong>Third-Party Dependencies:</strong> Our services depend on Pi Network and game publisher systems</li>
                <li><strong>Updates:</strong> We may update or modify our services without prior notice</li>
                <li><strong>Compatibility:</strong> Services may not be compatible with all devices or browsers</li>
                <li><strong>Geographic Limitations:</strong> Some features may not be available in all locations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Prohibited Activities and Conduct</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>The following activities are strictly prohibited:</p>
              <h4>Fraudulent Activities:</h4>
              <ul>
                <li>Using stolen or unauthorized payment methods</li>
                <li>Creating false identities or impersonating others</li>
                <li>Attempting to reverse or chargeback completed transactions</li>
                <li>Manipulating pricing or payment systems</li>
              </ul>
              <h4>Technical Violations:</h4>
              <ul>
                <li>Attempting to hack, crack, or compromise our systems</li>
                <li>Using automated tools, bots, or scripts</li>
                <li>Reverse engineering our software or services</li>
                <li>Interfering with other users' access to services</li>
              </ul>
              <h4>Commercial Violations:</h4>
              <ul>
                <li>Reselling gaming currency purchased through our platform</li>
                <li>Using our services for commercial purposes without authorization</li>
                <li>Creating multiple accounts to abuse promotions or limits</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>You acknowledge and agree that:</p>
              <ul>
                <li><strong>Our Content:</strong> All B4U Esports content, including design, text, graphics, and software, is our property</li>
                <li><strong>Game Content:</strong> PUBG Mobile and Mobile Legends content belongs to their respective publishers</li>
                <li><strong>Pi Network:</strong> Pi Network logos and content are used under license</li>
                <li><strong>Limited License:</strong> We grant you a limited, non-exclusive license to use our services</li>
                <li><strong>Restrictions:</strong> You may not copy, modify, distribute, or create derivative works</li>
                <li><strong>Feedback:</strong> Any feedback you provide may be used by us without compensation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Privacy and Data Usage</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>Your privacy is important to us. By using our services, you consent to:</p>
              <ul>
                <li>Collection and processing of personal data as outlined in our Privacy Policy</li>
                <li>Sharing necessary information with game publishers for service delivery</li>
                <li>Use of cookies and tracking technologies to improve our services</li>
                <li>Communication from us regarding your account and transactions</li>
                <li>Data transfer to third-party service providers for operational purposes</li>
                <li>Retention of transaction records for legal and compliance purposes</li>
              </ul>
              <p>Please review our Privacy Policy and Data Protection Policy for detailed information.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Disclaimers and Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>You understand and agree that:</p>
              <h4>Service Disclaimers:</h4>
              <ul>
                <li>Services are provided "as is" without warranties of any kind</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We are not responsible for third-party service failures</li>
                <li>Game publisher policies and systems are beyond our control</li>
              </ul>
              <h4>Limitation of Liability:</h4>
              <ul>
                <li>Our liability is limited to the amount paid for the specific transaction</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>You release us from claims arising from your use of our services</li>
                <li>These limitations apply to the fullest extent permitted by law</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Account Termination and Suspension</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We may terminate or suspend your account for:</p>
              <ul>
                <li>Violation of this Agreement or our policies</li>
                <li>Fraudulent or suspicious activity</li>
                <li>Violation of applicable laws or regulations</li>
                <li>Abuse of our customer support systems</li>
                <li>Multiple disputes or chargebacks</li>
                <li>Extended inactivity (with prior notice)</li>
              </ul>
              <p>Upon termination, your access to services will cease, but completed transactions remain valid. You may also terminate your account at any time by contacting our support team.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Dispute Resolution and Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>This Agreement is governed by the laws of Bhutan. For dispute resolution:</p>
              <h4>Resolution Process:</h4>
              <ol>
                <li><strong>Direct Communication:</strong> Contact our support team first</li>
                <li><strong>Good Faith Negotiation:</strong> Attempt to resolve disputes amicably</li>
                <li><strong>Mediation:</strong> Use neutral mediation if direct negotiation fails</li>
                <li><strong>Arbitration:</strong> Binding arbitration in Thimphu, Bhutan</li>
                <li><strong>Legal Action:</strong> Court proceedings only after exhausting other options</li>
              </ol>
              <h4>Limitations:</h4>
              <ul>
                <li>Claims must be filed within one year of the dispute arising</li>
                <li>Class action lawsuits are not permitted</li>
                <li>Disputes must be resolved individually</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Agreement Modifications</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We may modify this Agreement to reflect:</p>
              <ul>
                <li>Changes in our services or business practices</li>
                <li>Legal or regulatory requirements</li>
                <li>Industry standards and best practices</li>
                <li>User feedback and platform improvements</li>
              </ul>
              <p>We will notify you of material changes through:</p>
              <ul>
                <li>Email notifications to your registered address</li>
                <li>Prominent notices on our platform</li>
                <li>Updated agreement with revision date</li>
              </ul>
              <p>Continued use of our services after changes constitutes acceptance of the modified Agreement.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact Information and Support</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>For questions about this Agreement or our services:</p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p><strong>B4U Esports Customer Support</strong></p>
                <p>Email: <a href="mailto:info@b4uesports.com" className="text-primary">info@b4uesports.com</a></p>
                <p>Phone: <a href="tel:+97517875099" className="text-primary">+975 17875099</a></p>
                <p>Response Time: Within 24 hours</p>
                <p>Emergency Support: Available 24/7 for transaction issues</p>
              </div>
              <p className="mt-4">By using our services, you acknowledge that you have read, understood, and agree to be bound by this User Agreement in its entirety.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
