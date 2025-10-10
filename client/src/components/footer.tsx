import { Link } from 'wouter';
import { BRAND_LOGOS, SOCIAL_LINKS, CONTACT_INFO } from '@/lib/constants';
import { useState } from 'react';

export default function Footer() {
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(true);
  const [isLegalOpen, setIsLegalOpen] = useState(true);

  const toggleQuickLinks = () => {
    setIsQuickLinksOpen(!isQuickLinksOpen);
    // Scroll to top when minimized
    if (!isQuickLinksOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleLegal = () => {
    setIsLegalOpen(!isLegalOpen);
    // Scroll to top when minimized
    if (!isLegalOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-10 bg-card border-t border-border mt-20" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 text-center md:text-left" data-testid="footer-company">
            <div className="flex justify-center md:justify-start items-center space-x-4 mb-4">
              <img 
                src={BRAND_LOGOS.B4U} 
                alt="B4U Esports" 
                className="h-12 w-auto"
                data-testid="footer-logo"
              />
              <h3 className="text-xl font-bold">B4U Esports</h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto md:mx-0" data-testid="footer-description">
              The premier gaming marketplace powered by Pi Network. Purchase in-game currencies with Pi coins in a secure, fast, and reliable environment.
            </p>
            
            <div className="space-y-2 flex flex-col items-center md:items-start" data-testid="footer-contact">
              <p className="text-muted-foreground">
                <i className="fas fa-envelope mr-2"></i>
                <a href="mailto:info@b4uesports.com" className="hover:text-primary" data-testid="contact-email">
                  info@b4uesports.com
                </a>
              </p>
              <p className="text-muted-foreground">
                <i className="fab fa-whatsapp mr-2"></i>
                <a href="https://wa.me/+97517875099" target="_blank" rel="noopener noreferrer" className="hover:text-primary" data-testid="contact-whatsapp">
                  WhatsApp
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left" data-testid="footer-quick-links">
            <h4 className="text-lg font-semibold mb-4 flex justify-between items-center">
              Quick Links
              <button 
                onClick={toggleQuickLinks}
                className="md:hidden text-muted-foreground hover:text-primary"
                aria-label={isQuickLinksOpen ? "Minimize Quick Links" : "Expand Quick Links"}
              >
                <i className={`fas ${isQuickLinksOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </button>
            </h4>
            <ul className={`space-y-2 ${isQuickLinksOpen ? 'block' : 'hidden md:block'}`}>
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-home">Home</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-dashboard">Dashboard</Link></li>
              <li><Link href="/about-us" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-about">About Us</Link></li>
              <li><Link href="/our-history" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-history">Our History</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="text-center md:text-left" data-testid="footer-legal">
            <h4 className="text-lg font-semibold mb-4 flex justify-between items-center">
              Legal
              <button 
                onClick={toggleLegal}
                className="md:hidden text-muted-foreground hover:text-primary"
                aria-label={isLegalOpen ? "Minimize Legal" : "Expand Legal"}
              >
                <i className={`fas ${isLegalOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </button>
            </h4>
            <ul className={`space-y-2 ${isLegalOpen ? 'block' : 'hidden md:block'}`}>
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
            <div className="mb-4 md:mb-0" data-testid="footer-social">
              {/* Removed social media icons as requested */}
            </div>

            <div className="text-center md:text-right w-full md:w-auto" data-testid="footer-copyright">
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