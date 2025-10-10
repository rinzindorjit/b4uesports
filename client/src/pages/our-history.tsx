import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BRAND_LOGOS } from '@/lib/constants';
import { Link } from 'wouter';

export default function OurHistory() {
  const milestones = [
    {
      year: "2023",
      title: "Foundation & Vision",
      description: "B4U Esports was founded with a vision to revolutionize gaming commerce through cryptocurrency integration.",
      icon: "fa-rocket",
      color: "bg-gaming-blue"
    },
    {
      year: "2024",
      title: "Pi Network Partnership",
      description: "Strategic partnership with Pi Network established, becoming one of the first gaming platforms to integrate Pi cryptocurrency.",
      icon: "fa-handshake",
      color: "bg-gaming-purple"
    },
    {
      year: "2024",
      title: "PUBG Mobile Integration",
      description: "Successfully launched PUBG Mobile UC purchasing system with real-time Pi currency conversion.",
      icon: "fa-gamepad",
      color: "bg-gaming-green"
    },
    {
      year: "2024",
      title: "Mobile Legends Support",
      description: "Expanded services to include Mobile Legends: Bang Bang Diamond purchases, doubling our game portfolio.",
      icon: "fa-gem",
      color: "bg-gaming-gold"
    },
    {
      year: "2025",
      title: "Platform Maturity",
      description: "Achieved full platform stability with 24/7 support, real-time pricing, and enhanced security features.",
      icon: "fa-crown",
      color: "bg-gaming-red"
    }
  ];

  const achievements = [
    {
      number: "1000+",
      label: "Happy Users",
      icon: "fa-users",
      color: "text-gaming-blue"
    },
    {
      number: "5000+",
      label: "Transactions",
      icon: "fa-exchange-alt",
      color: "text-gaming-green"
    },
    {
      number: "99.9%",
      label: "Uptime",
      icon: "fa-server",
      color: "text-gaming-purple"
    },
    {
      number: "24/7",
      label: "Support",
      icon: "fa-headset",
      color: "text-gaming-gold"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="our-history-page">
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
          <div className="flex items-center justify-center mb-6">
            <img 
              src={BRAND_LOGOS.B4U} 
              alt="B4U Esports Logo" 
              className="h-20 w-auto mr-4"
              data-testid="history-logo"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">Our History</h1>
              <p className="text-muted-foreground">The Journey of Innovation and Growth</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-book text-primary mr-3"></i>
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                B4U Esports began as a vision to bridge the gap between traditional gaming commerce and the emerging world of cryptocurrency. Founded by passionate gamers and technology enthusiasts, our company was born from the belief that gaming should be at the forefront of financial innovation.
              </p>
              <p>
                From our humble beginnings to becoming a pioneer in Pi Network-integrated gaming services, our journey has been marked by continuous innovation, user-focused development, and an unwavering commitment to security and reliability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-timeline text-gaming-blue mr-3"></i>
                Key Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-4" data-testid={`milestone-${index}`}>
                    <div className={`w-12 h-12 ${milestone.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <i className={`fas ${milestone.icon} text-white`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {milestone.year}
                        </Badge>
                        <h3 className="text-lg font-semibold">{milestone.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-trophy text-gaming-gold mr-3"></i>
                Achievements by Numbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-center" data-testid={`achievement-${index}`}>
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className={`fas ${achievement.icon} text-2xl ${achievement.color}`}></i>
                    </div>
                    <div className="text-2xl font-bold mb-1">{achievement.number}</div>
                    <div className="text-sm text-muted-foreground">{achievement.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-lightbulb text-gaming-purple mr-3"></i>
                Innovation Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg" data-testid="innovation-pi-integration">
                  <h4 className="text-lg font-semibold mb-2 text-gaming-blue">
                    <i className="fas fa-coins mr-2"></i>First-to-Market Pi Integration
                  </h4>
                  <p>
                    We were among the first gaming platforms to successfully integrate Pi Network's payment system, pioneering the use of Pi cryptocurrency for gaming transactions.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="innovation-realtime">
                  <h4 className="text-lg font-semibold mb-2 text-gaming-green">
                    <i className="fas fa-chart-line mr-2"></i>Real-Time Price Engine
                  </h4>
                  <p>
                    Developed a sophisticated real-time pricing system that updates Pi/USD conversion rates every 60 seconds, ensuring accurate and fair pricing for all transactions.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="innovation-security">
                  <h4 className="text-lg font-semibold mb-2 text-gaming-red">
                    <i className="fas fa-shield-alt mr-2"></i>Advanced Security Framework
                  </h4>
                  <p>
                    Implemented multi-layered security measures including blockchain verification, encrypted data storage, and secure payment processing to protect user transactions.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="innovation-automation">
                  <h4 className="text-lg font-semibold mb-2 text-gaming-purple">
                    <i className="fas fa-robot mr-2"></i>Automated Delivery System
                  </h4>
                  <p>
                    Created an automated delivery system that processes gaming currency purchases within 5-10 minutes, providing instant gratification for users.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-users text-gaming-blue mr-3"></i>
                Community Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                Our growth has been driven by the trust and support of our gaming community. From our first transaction to thousands of successful purchases, each milestone has been achieved through:
              </p>
              <ul>
                <li><strong>User Feedback:</strong> Continuously improving based on community suggestions</li>
                <li><strong>Transparency:</strong> Maintaining open communication about platform updates and changes</li>
                <li><strong>Reliability:</strong> Ensuring consistent service quality and uptime</li>
                <li><strong>Innovation:</strong> Staying ahead of technology trends and user needs</li>
                <li><strong>Support:</strong> Providing responsive customer service and technical assistance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-handshake text-gaming-purple mr-3"></i>
                Strategic Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={BRAND_LOGOS.PI} 
                    alt="Pi Network" 
                    className="w-12 h-12 rounded-full mt-1"
                    data-testid="partner-pi-network"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">Pi Network</h4>
                    <p className="text-muted-foreground">
                      Our foundational partnership with Pi Network enables secure, innovative cryptocurrency transactions for gaming purchases.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <img 
                    src="https://cdn.midasbuy.com/images/pubgm_app-icon_512x512%281%29.e9f7efc0.png" 
                    alt="PUBG Mobile" 
                    className="w-12 h-12 rounded-lg mt-1"
                    data-testid="partner-pubg"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">PUBG Mobile Ecosystem</h4>
                    <p className="text-muted-foreground">
                      Authorized integration with PUBG Mobile's UC system, ensuring legitimate and secure currency delivery.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <img 
                    src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTT-Neggt-JpAh4eDx84JswmFwJMOa4pcfhqtcTcxtywIGC4IfB" 
                    alt="Mobile Legends" 
                    className="w-12 h-12 rounded-lg mt-1"
                    data-testid="partner-mlbb"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">Mobile Legends: Bang Bang</h4>
                    <p className="text-muted-foreground">
                      Official partnership for Diamond delivery services, expanding our reach in the MOBA gaming community.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-road text-gaming-green mr-3"></i>
                Looking Forward
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                As we continue to grow, our focus remains on innovation, security, and user satisfaction. Our roadmap includes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-muted p-4 rounded-lg" data-testid="future-games">
                  <h4 className="font-semibold mb-2 text-gaming-blue">
                    <i className="fas fa-plus mr-2"></i>New Game Support
                  </h4>
                  <p className="text-sm">Expanding to support more popular mobile games and their in-game currencies.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="future-features">
                  <h4 className="font-semibold mb-2 text-gaming-purple">
                    <i className="fas fa-cogs mr-2"></i>Enhanced Features
                  </h4>
                  <p className="text-sm">Advanced user dashboard, loyalty programs, and personalized gaming experiences.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="future-global">
                  <h4 className="font-semibold mb-2 text-gaming-green">
                    <i className="fas fa-globe mr-2"></i>Global Expansion
                  </h4>
                  <p className="text-sm">Extending our services to more countries and supporting additional payment methods.</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg" data-testid="future-technology">
                  <h4 className="font-semibold mb-2 text-gaming-gold">
                    <i className="fas fa-rocket mr-2"></i>Next-Gen Technology
                  </h4>
                  <p className="text-sm">Implementing AI-powered recommendations and blockchain-based transaction verification.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-heart text-gaming-red mr-3"></i>
                Thank You
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="bg-gradient-to-r from-gaming-blue to-gaming-purple p-6 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Thank You for Being Part of Our Journey
                </h3>
                <p className="text-blue-100 mb-4">
                  Every transaction, every piece of feedback, and every moment of trust you've placed in us has helped shape B4U Esports into what it is today.
                </p>
                <p className="text-blue-100">
                  Together, we're not just changing how gamers purchase in-game currencies – we're pioneering the future of gaming commerce.
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
