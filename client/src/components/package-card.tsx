import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Package } from '@/types/pi-network';

interface PackageCardProps {
  package: Package;
  onPurchase: () => void;
  'data-testid'?: string;
}

export default function PackageCard({ package: pkg, onPurchase, 'data-testid': testId }: PackageCardProps) {
  const gameName = pkg.game === 'PUBG' ? 'PUBG Mobile' : 'Mobile Legends';

  return (
    <Card className="game-card hover:transform hover:-translate-y-2 transition-all duration-300 h-full border-2 border-border hover:border-primary" data-testid={testId}>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col items-center mb-3 md:mb-4">
          <img 
            src={pkg.image} 
            alt={gameName} 
            className="w-16 h-16 object-contain mb-2" // Centered image without background
            data-testid={`${testId}-logo`}
          />
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold" data-testid={`${testId}-name`}>
              {pkg.name}
            </h3>
            <p className="text-muted-foreground text-xs md:text-sm">
              {pkg.game === 'PUBG' ? `${pkg.inGameAmount} UC` : `${pkg.inGameAmount} Diamonds`}
            </p>
          </div>
        </div>
        
        <div className="flex justify-center items-center mb-4">
          <div className="text-center">
            <span className="text-lg md:text-xl font-bold text-primary font-mono" data-testid={`${testId}-pi-price`}>
              {pkg.piPrice ? `${pkg.piPrice.toFixed(1)} π` : 'N/A'}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={onPurchase}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base py-2 h-auto"
          data-testid={`${testId}-buy-button`}
        >
          <i className="fas fa-shopping-cart mr-2"></i>
          Buy Now
        </Button>
      </CardContent>
    </Card>
  );
}