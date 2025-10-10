import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function DataProtection() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="data-protection-page">
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
          <h1 className="text-4xl font-bold mb-4">Data Protection Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Our Commitment to Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>B4U Esports is committed to protecting your personal data and respecting your privacy rights. This Data Protection Policy outlines how we collect, process, store, and protect your information in compliance with applicable data protection laws and regulations.</p>
              <p>We implement robust technical and organizational measures to ensure the security and confidentiality of your personal data throughout our systems and processes.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Legal Basis for Processing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We process your personal data based on the following legal grounds:</p>
              <ul>
                <li><strong>Consent:</strong> You have given clear consent for us to process your data for specific purposes</li>
                <li><strong>Contract Performance:</strong> Processing is necessary to fulfill our service obligations to you</li>
                <li><strong>Legal Obligations:</strong> We must process your data to comply with legal requirements</li>
                <li><strong>Legitimate Interests:</strong> Processing serves our legitimate business interests while respecting your rights</li>
                <li><strong>Vital Interests:</strong> Processing protects your essential interests or those of others</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Data Collection and Processing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We collect and process the following types of personal data:</p>
              <h4>Identity Data:</h4>
              <ul>
                <li>Pi Network username and UID</li>
                <li>Email address and phone number</li>
                <li>Country and language preferences</li>
              </ul>
              <h4>Gaming Data:</h4>
              <ul>
                <li>PUBG Mobile IGN and UID</li>
                <li>Mobile Legends User ID and Zone ID</li>
                <li>Gaming preferences and history</li>
              </ul>
              <h4>Transaction Data:</h4>
              <ul>
                <li>Payment history and amounts</li>
                <li>Pi Network transaction details</li>
                <li>Purchase patterns and preferences</li>
              </ul>
              <h4>Technical Data:</h4>
              <ul>
                <li>IP address and device information</li>
                <li>Browser type and settings</li>
                <li>Usage analytics and performance data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security Measures</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We implement comprehensive security measures to protect your data:</p>
              <h4>Technical Safeguards:</h4>
              <ul>
                <li>End-to-end encryption for data transmission</li>
                <li>Secure database storage with encryption at rest</li>
                <li>Multi-factor authentication for admin access</li>
                <li>Regular security audits and penetration testing</li>
                <li>Automated backup and disaster recovery systems</li>
              </ul>
              <h4>Organizational Safeguards:</h4>
              <ul>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Regular staff training on data protection</li>
                <li>Confidentiality agreements for all personnel</li>
                <li>Incident response procedures</li>
                <li>Data protection impact assessments</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Retention and Deletion</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We retain your personal data only for as long as necessary:</p>
              <ul>
                <li><strong>Active Accounts:</strong> Data retained while your account is active and in use</li>
                <li><strong>Transaction Records:</strong> Kept for 7 years for legal and tax compliance</li>
                <li><strong>Marketing Data:</strong> Retained until you withdraw consent or object</li>
                <li><strong>Support Records:</strong> Kept for 3 years after last contact</li>
                <li><strong>Legal Hold:</strong> Extended retention if required for legal proceedings</li>
              </ul>
              <p>When retention periods expire, we securely delete or anonymize your data using industry-standard methods.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Data Protection Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>You have the following rights regarding your personal data:</p>
              <ul>
                <li><strong>Right of Access:</strong> Request information about your personal data we process</li>
                <li><strong>Right of Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right of Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for consent-based processing</li>
              </ul>
              <p>To exercise these rights, contact us at <a href="mailto:info@b4uesports.com" className="text-primary">info@b4uesports.com</a></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>When we transfer your data internationally, we ensure adequate protection through:</p>
              <ul>
                <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate data protection laws</li>
                <li><strong>Standard Contractual Clauses:</strong> EU-approved clauses for international transfers</li>
                <li><strong>Binding Corporate Rules:</strong> Internal rules ensuring consistent protection</li>
                <li><strong>Certification Schemes:</strong> Industry-recognized data protection certifications</li>
                <li><strong>Codes of Conduct:</strong> Adherence to approved industry standards</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Third-Party Data Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We share your data with third parties only when necessary and with appropriate safeguards:</p>
              <h4>Service Providers:</h4>
              <ul>
                <li>Cloud hosting and storage providers</li>
                <li>Email and communication services</li>
                <li>Analytics and monitoring tools</li>
                <li>Customer support platforms</li>
              </ul>
              <h4>Game Publishers:</h4>
              <ul>
                <li>PUBG Mobile (Tencent/Krafton) for UC delivery</li>
                <li>Mobile Legends (Moonton) for Diamond delivery</li>
              </ul>
              <h4>Payment Processors:</h4>
              <ul>
                <li>Pi Network for authentication and payments</li>
              </ul>
              <p>All third parties are contractually obligated to protect your data and use it only for specified purposes.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Data Breach Response</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>In the event of a data breach, we have established procedures to:</p>
              <ul>
                <li><strong>Detection:</strong> Automated monitoring systems detect potential breaches</li>
                <li><strong>Assessment:</strong> Rapid evaluation of breach scope and impact</li>
                <li><strong>Containment:</strong> Immediate steps to stop the breach and secure systems</li>
                <li><strong>Notification:</strong> Authorities notified within 72 hours if required</li>
                <li><strong>Communication:</strong> Affected users informed without undue delay</li>
                <li><strong>Remediation:</strong> Steps taken to prevent future occurrences</li>
                <li><strong>Documentation:</strong> Full incident report and lessons learned</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Privacy by Design</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We implement privacy by design principles throughout our operations:</p>
              <ul>
                <li><strong>Data Minimization:</strong> Collect only data necessary for our services</li>
                <li><strong>Purpose Limitation:</strong> Use data only for stated purposes</li>
                <li><strong>Storage Limitation:</strong> Retain data only as long as necessary</li>
                <li><strong>Accuracy:</strong> Ensure data is accurate and up-to-date</li>
                <li><strong>Security:</strong> Implement appropriate technical and organizational measures</li>
                <li><strong>Accountability:</strong> Demonstrate compliance with data protection principles</li>
                <li><strong>Transparency:</strong> Provide clear information about data processing</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Children's Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We take special care to protect children's personal data:</p>
              <ul>
                <li>We do not knowingly collect data from children under 13</li>
                <li>Enhanced verification procedures for users under 18</li>
                <li>Parental consent mechanisms where required</li>
                <li>Additional security measures for young users</li>
                <li>Regular reviews of age verification processes</li>
                <li>Immediate deletion if we discover underage data collection</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact and Complaints</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>For data protection inquiries or complaints:</p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p><strong>Data Protection Officer</strong></p>
                <p>B4U Esports</p>
                <p>Email: <a href="mailto:info@b4uesports.com" className="text-primary">info@b4uesports.com</a></p>
                <p>Phone: <a href="tel:+97517875099" className="text-primary">+975 17875099</a></p>
                <p>Response Time: Within 30 days</p>
              </div>
              <p className="mt-4">You also have the right to lodge a complaint with your local data protection authority if you believe we have not addressed your concerns adequately.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
