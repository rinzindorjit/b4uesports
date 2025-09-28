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
    <Card className="game-card hover:transform hover:-translate-y-2 transition-all duration-300 h-full" data-testid={testId}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center mb-3 md:mb-4">
          <img 
            src={pkg.image} 
            alt={gameName} 
            className="w-10 h-10 md:w-12 md:h-12 mr-2 md:mr-3 object-contain"
            data-testid={`${testId}-logo`}
          />
          <div>
            <h3 className="text-lg md:text-xl font-bold" data-testid={`${testId}-name`}>
              {pkg.name}
            </h3>
            <p className="text-muted-foreground text-xs md:text-sm">
              {pkg.game === 'PUBG' ? 'UC Package' : 'Diamonds Package'}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl md:text-2xl font-bold text-green-400 font-mono" data-testid={`${testId}-pi-price`}>
            {pkg.piPrice ? `${pkg.piPrice.toFixed(1)} π` : 'Price unavailable'}
          </span>
          <span className="text-xs md:text-sm text-muted-foreground" data-testid={`${testId}-usd-price`}>
            ≈ ${pkg.usdtValue}
          </span>
        </div>
        
        <Button 
          onClick={onPurchase}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base"
          data-testid={`${testId}-buy-button`}
        >
          Buy Now
        </Button>
      </CardContent>
    </Card>
  );
}