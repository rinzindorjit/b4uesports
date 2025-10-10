import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Package } from '@/types/pi-network';

interface PackageCardProps {
  package: Package;
  onPurchase: () => void;
  'data-testid'?: string;
}

export default function PackageCard({ package: pkg, onPurchase, 'data-testid': testId }: PackageCardProps) {
  return (
    <>
      {/* Show placeholder or nothing when package is null */}
      {!pkg ? (
        <div className="hidden"></div>
      ) : (
        <Card className="game-card hover:transform hover:-translate-y-1 transition-all duration-300 h-full border-2 border-border hover:border-primary" data-testid={testId}>
          <CardContent className="p-3">
            <div className="flex flex-col items-center mb-2">
              <img 
                src={pkg.image} 
                alt={pkg.name} 
                className="w-12 h-12 object-contain mb-1" // Smaller images with transparent background
                onError={(e) => {
                  // Handle image loading errors
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iMzIiIHk9IjMyIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlBhY2thZ2U8L3RleHQ+PC9zdmc+';
                }}
                data-testid={`${testId}-logo`}
              />
              <div className="text-center">
                <h3 className="text-xs font-bold" data-testid={`${testId}-name`}>
                  {pkg.name || 'Unnamed Package'}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {pkg.game === 'PUBG' ? `${pkg.inGameAmount || 0} UC` : `${pkg.inGameAmount || 0} Diamonds`}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center items-center mb-3">
              <div className="text-center">
                <span className="text-sm font-bold text-primary font-mono" data-testid={`${testId}-pi-price`}>
                  {pkg.piPrice ? `${pkg.piPrice} π` : 'N/A'}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={onPurchase}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1 h-auto"
              data-testid={`${testId}-buy-button`}
              disabled={!pkg.isActive}
            >
              <i className="fas fa-shopping-cart mr-1 text-xs"></i>
              Buy
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}