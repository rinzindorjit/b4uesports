import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COUNTRIES } from '@/lib/constants';

interface CountrySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (countryCode: string) => void;
  selectedCountry: string;
}

export default function CountrySelector({ isOpen, onClose, onSelect, selectedCountry }: CountrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (countryCode: string) => {
    onSelect(countryCode);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4 sm:mx-auto" data-testid="country-selector">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Country</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-base"
            data-testid="country-search"
          />
          
          <ScrollArea className="h-80">
            <div className="space-y-1">
              {filteredCountries.map((country) => (
                <Button
                  key={country.code}
                  variant={selectedCountry === country.code ? "default" : "ghost"}
                  className="w-full justify-start h-12 text-base"
                  onClick={() => handleSelect(country.code)}
                  data-testid={`country-option-${country.code}`}
                >
                  <span className="mr-3 text-lg">{country.flag}</span>
                  <span className="truncate">{country.name}</span>
                  {selectedCountry === country.code && (
                    <i className="fas fa-check ml-auto text-primary"></i>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
          
          {filteredCountries.length === 0 && (
            <div className="text-center text-muted-foreground py-8" data-testid="no-countries">
              No countries found matching "{searchTerm}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
