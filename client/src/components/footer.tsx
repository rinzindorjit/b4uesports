import { Link } from 'wouter';
import { BRAND_LOGOS, SOCIAL_LINKS, CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-card border-t border-border mt-20" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2" data-testid="footer-company">
            <div className="flex items-center space-x-4 mb-4">
              <img 
                src={BRAND_LOGOS.B4U} 
                alt="B4U Esports" 
                className="h-12 w-auto"
                data-testid="footer-logo"
              />
              <h3 className="text-xl font-bold">B4U Esports</h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md" data-testid="footer-description">
              The premier gaming marketplace powered by Pi Network. Purchase in-game currencies with Pi coins in a secure, fast, and reliable environment.
            </p>
            
            <div className="space-y-2" data-testid="footer-contact">
              <p className="text-muted-foreground">
                <i className="fas fa-envelope mr-2"></i>
                <a href={`mailto:${CONTACT_INFO.EMAIL}`} className="hover:text-primary" data-testid="contact-email">
                  {CONTACT_INFO.EMAIL}
                </a>
              </p>
              <p className="text-muted-foreground">
                <i className="fab fa-whatsapp mr-2"></i>
                <a href="https://wa.me/+97517875099" target="_blank" rel="noopener noreferrer" className="hover:text-primary" data-testid="contact-whatsapp">
                  WhatsApp: +975 17875099
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div data-testid="footer-quick-links">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-home">Home</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-dashboard">Dashboard</Link></li>
              <li><Link href="/about-us" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-about">About Us</Link></li>
              <li><Link href="/our-history" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-history">Our History</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div data-testid="footer-legal">
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-refund">Refund Policy</Link></li>
              <li><Link href="/data-protection" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-data-protection">Data Protection</Link></li>
              <li><Link href="/user-agreement" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-user-agreement">User Agreement</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0" data-testid="footer-social">
              <a 
                href={SOCIAL_LINKS.FACEBOOK} 
                className="social-icon text-muted-foreground hover:text-blue-500 transition-colors text-xl"
                data-testid="social-facebook"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a 
                href={SOCIAL_LINKS.YOUTUBE} 
                className="social-icon text-muted-foreground hover:text-red-500 transition-colors text-xl"
                data-testid="social-youtube"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a 
                href={SOCIAL_LINKS.TIKTOK} 
                className="social-icon text-muted-foreground hover:text-pink-500 transition-colors text-xl"
                data-testid="social-tiktok"
                aria-label="TikTok"
              >
                <i className="fab fa-tiktok"></i>
              </a>
              <a 
                href={SOCIAL_LINKS.INSTAGRAM} 
                className="social-icon text-muted-foreground hover:text-purple-500 transition-colors text-xl"
                data-testid="social-instagram"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href={SOCIAL_LINKS.LINKEDIN} 
                className="social-icon text-muted-foreground hover:text-blue-600 transition-colors text-xl"
                data-testid="social-linkedin"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin"></i>
              </a>
            </div>

            <div className="text-center md:text-right" data-testid="footer-copyright">
              <p className="text-muted-foreground text-sm mb-2">© 2025 B4U Esports. All Rights Reserved.</p>
              <div className="flex items-center justify-center md:justify-end space-x-2">
                <span className="text-muted-foreground text-sm">Powered by</span>
                <img 
                  src={BRAND_LOGOS.PI} 
                  alt="Pi Network" 
                  className="w-6 h-6 rounded-full"
                  data-testid="pi-logo"
                />
                <span className="text-primary text-sm font-semibold">Pi Network</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}