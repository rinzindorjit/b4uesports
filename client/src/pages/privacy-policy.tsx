import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="privacy-policy-page">
      <ParticleBackground />
      <Navigation isTestnet={true} />
      
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>When you use B4U Esports services, we collect:</p>
              <ul>
                <li><strong>Pi Network Information:</strong> Your Pi Network username, UID, and wallet address through Pi Network authentication</li>
                <li><strong>Personal Information:</strong> Email address, phone number, country, and language preferences</li>
                <li><strong>Gaming Information:</strong> Game account details including PUBG Mobile IGN/UID and Mobile Legends User ID/Zone ID</li>
                <li><strong>Transaction Data:</strong> Payment history, transaction amounts, and payment status</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information, and usage data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We use your information to:</p>
              <ul>
                <li>Process and fulfill your gaming currency purchases</li>
                <li>Authenticate your identity through Pi Network</li>
                <li>Send purchase confirmations and transaction updates</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations and prevent fraud</li>
                <li>Send important service announcements and updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:</p>
              <ul>
                <li><strong>Pi Network:</strong> Authentication and payment processing through Pi Network's secure infrastructure</li>
                <li><strong>Game Publishers:</strong> Necessary game account information to deliver purchased gaming currency</li>
                <li><strong>Service Providers:</strong> Trusted third-party services that help us operate our platform (email services, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                <li><strong>Safety and Security:</strong> To protect our users, platform, and legal rights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We implement robust security measures to protect your information:</p>
              <ul>
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure storage of personal and financial information</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Pi Network's cryptographic security for payment processing</li>
                <li>Hashed storage of sensitive authentication data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>You have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing where applicable</li>
              </ul>
              <p>To exercise these rights, contact us at <a href="mailto:info@b4uesports.com" className="text-primary">info@b4uesports.com</a></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Maintain your login session</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze website usage and performance</li>
                <li>Provide personalized content and features</li>
              </ul>
              <p>You can control cookie settings through your browser, though some features may not function properly if cookies are disabled.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. International Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>Your information may be transferred to and processed in countries other than your residence. We ensure appropriate safeguards are in place to protect your data during international transfers, including:</p>
              <ul>
                <li>Compliance with applicable data protection laws</li>
                <li>Contractual protections with service providers</li>
                <li>Security measures equivalent to those in your home country</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. We will notify you of material changes by:</p>
              <ul>
                <li>Posting the updated policy on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying prominent notices on our platform</li>
              </ul>
              <p>Your continued use of our services after changes constitute acceptance of the updated policy.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p><strong>B4U Esports</strong></p>
                <p>Email: <a href="mailto:info@b4uesports.com" className="text-primary">info@b4uesports.com</a></p>
                <p>Phone: <a href="tel:+97517875099" className="text-primary">+975 17875099</a></p>
                <p>We will respond to your inquiries within 30 days.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
