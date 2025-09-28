import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PACKAGE_IMAGES } from '@/lib/constants';
import type { Package } from '@/types/pi-network';

interface PackageCardProps {
  package: Package;
  onPurchase: () => void;
  'data-testid'?: string;
}

export default function PackageCard({ package: pkg, onPurchase, 'data-testid': testId }: PackageCardProps) {
  const packageImageUrl = pkg.game === 'PUBG' ? PACKAGE_IMAGES.PUBG : PACKAGE_IMAGES.MLBB;
  const gameName = pkg.game === 'PUBG' ? 'PUBG Mobile' : 'Mobile Legends';

  return (
    <Card className="game-card hover:transform hover:-translate-y-2 transition-all duration-300" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <img 
            src={packageImageUrl} 
            alt={gameName} 
            className="w-12 h-12 mr-3 object-contain"
            data-testid={`${testId}-logo`}
          />
          <div>
            <h3 className="text-xl font-bold" data-testid={`${testId}-name`}>
              {pkg.name}
            </h3>
            <p className="text-muted-foreground text-sm">
              {pkg.game === 'PUBG' ? 'UC Package' : 'Diamonds Package'}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-green-400 font-mono" data-testid={`${testId}-pi-price`}>
            {pkg.piPrice ? `${pkg.piPrice.toFixed(1)} π` : 'Loading...'}
          </span>
          <span className="text-sm text-muted-foreground" data-testid={`${testId}-usd-price`}>
            ≈ ${pkg.usdtValue}
          </span>
        </div>
        
        <Button 
          onClick={onPurchase}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          data-testid={`${testId}-buy-button`}
        >
          Buy Now
        </Button>
      </CardContent>
    </Card>
  );
}