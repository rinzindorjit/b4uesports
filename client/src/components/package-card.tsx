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
  // Determine which image to use based on package type
  const packageImageUrl = pkg.game === 'PUBG' ? PACKAGE_IMAGES.UC : PACKAGE_IMAGES.DIAMOND;

  return (
    <Card className="game-card hover:transform hover:-translate-y-2 transition-all duration-300" data-testid={testId}>
      <CardContent className="p-6">
        {/* Package image */}
        <div className="flex justify-center mb-4">
          <img 
            src={packageImageUrl} 
            alt={pkg.name} 
            className="w-16 h-16 object-contain"
            data-testid={`${testId}-package-image`}
          />
        </div>
        
        {/* Package name below image */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold" data-testid={`${testId}-name`}>
            {pkg.name}
          </h3>
        </div>
        
        <div className="flex justify-center items-center mb-4">
          <span className="text-2xl font-bold text-green-400 font-mono" data-testid={`${testId}-pi-price`}>
            {pkg.piPrice ? `${parseFloat(pkg.piPrice.toFixed(2))} π` : 'Loading...'}
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