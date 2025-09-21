import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BRAND_LOGOS, CONTACT_INFO, SOCIAL_LINKS } from '@/lib/constants';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="about-us-page">
      <ParticleBackground />
      <Navigation isTestnet={import.meta.env.DEV} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={BRAND_LOGOS.B4U} 
              alt="B4U Esports Logo" 
              className="h-20 w-auto mr-4"
              data-testid="about-us-logo"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">About B4U Esports</h1>
              <p className="text-muted-foreground">Pioneering the Future of Gaming Commerce</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-rocket text-primary mr-3"></i>
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                B4U Esports is dedicated to revolutionizing the gaming marketplace by seamlessly integrating cryptocurrency payments through Pi Network. We believe that gaming should be accessible, secure, and innovative, bridging the gap between traditional gaming commerce and the future of digital currency.
              </p>
              <p>
                Our mission is to empower gamers worldwide with a safe, reliable, and cutting-edge platform where they can purchase in-game currencies using Pi coins, creating a new standard for digital gaming transactions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-eye text-gaming-blue mr-3"></i>
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                To become the world's leading Pi Network-integrated gaming marketplace, setting the standard for cryptocurrency adoption in the gaming industry. We envision a future where digital currency transactions are as natural as traditional payments, making gaming more inclusive and accessible globally.
              </p>
              <p>
                We strive to be the bridge that connects the gaming community with the revolutionary potential of Pi Network, creating opportunities for millions of gamers to participate in the digital economy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-heart text-gaming-red mr-3"></i>
                Our Values
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted p-4 rounded-lg" data-testid="value-security">
                  <h4 className="text-lg font-semibold mb-2 text-gaming-blue">
                    <i className="fas fa-shield-alt mr-2"></i>Security First
                  </h4>
                  <p>We prioritize the security of our users' data and transactions, implementing industry-leading security measures and Pi Network's cryptographic protection.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="value-innovation">
                  <h4 className="text-lg font-semibold mb-2 text-gaming-purple">
                    <i className="fas fa-lightbulb mr-2"></i>Innovation
                  </h4>
                  <p>We embrace cutting-edge technology and continuously evolve our platform to provide the best possible user experience.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="value-transparency">
                  <h4 className="text-lg font-semibold mb-2 text-gaming-green">
                    <i className="fas fa-balance-scale mr-2"></i>Transparency
                  </h4>
                  <p>We believe in open communication with our users, providing clear information about pricing, policies, and processes.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="value-community">
                  <h4 className="text-lg font-semibold mb-2 text-gaming-gold">
                    <i className="fas fa-users mr-2"></i>Community Focus
                  </h4>
                  <p>Our users are at the heart of everything we do. We listen to feedback and continuously improve based on community needs.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-handshake text-gaming-purple mr-3"></i>
                Pi Network Partnership
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="flex items-start space-x-4">
                <img 
                  src={BRAND_LOGOS.PI} 
                  alt="Pi Network Logo" 
                  className="w-16 h-16 rounded-full mt-2"
                  data-testid="pi-network-logo"
                />
                <div>
                  <p>
                    Our partnership with Pi Network represents a significant milestone in bringing cryptocurrency to the gaming world. By integrating Pi Network's revolutionary payment system, we offer users a secure, fast, and innovative way to purchase gaming currencies.
                  </p>
                  <p>
                    This collaboration allows us to leverage Pi Network's growing ecosystem while providing their community with practical utility for their Pi coins in the gaming space.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-gamepad text-gaming-blue mr-3"></i>
                Gaming Excellence
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We specialize in providing premium gaming currency services for popular mobile games:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-muted p-4 rounded-lg" data-testid="game-pubg">
                  <div className="flex items-center mb-3">
                    <img 
                      src="https://cdn.midasbuy.com/images/pubgm_app-icon_512x512%281%29.e9f7efc0.png" 
                      alt="PUBG Mobile" 
                      className="w-12 h-12 mr-3"
                    />
                    <h4 className="text-lg font-semibold">PUBG Mobile</h4>
                  </div>
                  <p>Providing UC (Unknown Cash) packages for one of the world's most popular battle royale games, enabling players to enhance their gaming experience.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="game-mlbb">
                  <div className="flex items-center mb-3">
                    <img 
                      src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTT-Neggt-JpAh4eDx84JswmFwJMOa4pcfhqtcTcxtywIGC4IfB" 
                      alt="Mobile Legends" 
                      className="w-12 h-12 mr-3"
                    />
                    <h4 className="text-lg font-semibold">Mobile Legends: Bang Bang</h4>
                  </div>
                  <p>Offering Diamond packages for the leading MOBA game, helping players unlock heroes, skins, and premium content.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-line text-gaming-green mr-3"></i>
                Why Choose B4U Esports?
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4" data-testid="feature-realtime">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-clock text-2xl text-white"></i>
                  </div>
                  <h4 className="font-semibold mb-2">Real-Time Pricing</h4>
                  <p className="text-sm">Live Pi/USD conversion rates updated every 60 seconds for accurate pricing.</p>
                </div>
                
                <div className="text-center p-4" data-testid="feature-security">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-lock text-2xl text-white"></i>
                  </div>
                  <h4 className="font-semibold mb-2">Secure Transactions</h4>
                  <p className="text-sm">Protected by Pi Network's advanced cryptographic security and our robust infrastructure.</p>
                </div>
                
                <div className="text-center p-4" data-testid="feature-support">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-headset text-2xl text-white"></i>
                  </div>
                  <h4 className="font-semibold mb-2">24/7 Support</h4>
                  <p className="text-sm">Round-the-clock customer support to assist with any questions or issues.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-phone text-primary mr-3"></i>
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We'd love to hear from you! Whether you have questions, feedback, or need support, our team is here to help.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-muted p-4 rounded-lg" data-testid="contact-info">
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <i className="fas fa-envelope text-primary mr-2"></i>
                      <a href={`mailto:${CONTACT_INFO.EMAIL}`} className="text-primary hover:underline">
                        {CONTACT_INFO.EMAIL}
                      </a>
                    </p>
                    <p className="flex items-center">
                      <i className="fas fa-phone text-primary mr-2"></i>
                      <a href={`tel:${CONTACT_INFO.PHONE}`} className="text-primary hover:underline">
                        {CONTACT_INFO.PHONE}
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="social-media">
                  <h4 className="font-semibold mb-3">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a href={SOCIAL_LINKS.FACEBOOK} className="text-blue-500 hover:text-blue-400 transition-colors">
                      <i className="fab fa-facebook text-2xl"></i>
                    </a>
                    <a href={SOCIAL_LINKS.YOUTUBE} className="text-red-500 hover:text-red-400 transition-colors">
                      <i className="fab fa-youtube text-2xl"></i>
                    </a>
                    <a href={SOCIAL_LINKS.TIKTOK} className="text-pink-500 hover:text-pink-400 transition-colors">
                      <i className="fab fa-tiktok text-2xl"></i>
                    </a>
                    <a href={SOCIAL_LINKS.INSTAGRAM} className="text-purple-500 hover:text-purple-400 transition-colors">
                      <i className="fab fa-instagram text-2xl"></i>
                    </a>
                    <a href={SOCIAL_LINKS.LINKEDIN} className="text-blue-600 hover:text-blue-500 transition-colors">
                      <i className="fab fa-linkedin text-2xl"></i>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-certificate text-gaming-gold mr-3"></i>
                Our Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                At B4U Esports, we are committed to providing a safe, reliable, and innovative platform for all gamers. We continuously invest in technology, security, and user experience to ensure that our platform meets the highest standards of quality and reliability.
              </p>
              <p>
                As we grow and evolve, we remain dedicated to our core mission of making gaming more accessible and enjoyable through the power of cryptocurrency and innovative technology.
              </p>
              <div className="bg-gradient-to-r from-gaming-blue to-gaming-purple p-6 rounded-lg mt-6 text-center">
                <p className="text-lg font-semibold text-white mb-2">
                  Thank you for choosing B4U Esports!
                </p>
                <p className="text-blue-100">
                  Together, we're building the future of gaming commerce.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
