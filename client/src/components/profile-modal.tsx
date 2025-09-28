import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePiNetwork } from '@/hooks/use-pi-network';
import CountrySelector from '@/components/country-selector';
import { COUNTRIES, LANGUAGES, GAME_LOGOS } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@/types/pi-network';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, token } = usePiNetwork();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    country: 'Bhutan',
    language: 'en',
    profileImage: '',
    gameAccounts: {
      pubg: { ign: '', uid: '' },
      mlbb: { userId: '', zoneId: '' }
    },
    referralCode: ''
  });

  const [showCountrySelector, setShowCountrySelector] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || 'Bhutan',
        language: user.language || 'en',
        profileImage: user.profileImage || '',
        gameAccounts: {
          pubg: {
            ign: user.gameAccounts?.pubg?.ign || '',
            uid: user.gameAccounts?.pubg?.uid || ''
          },
          mlbb: {
            userId: user.gameAccounts?.mlbb?.userId || '',
            zoneId: user.gameAccounts?.mlbb?.zoneId || ''
          }
        },
        referralCode: user.referralCode || ''
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (formData.email && !formData.email.endsWith('@gmail.com')) {
      toast({
        title: "Error",
        description: "Email must be a Gmail address",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Email and phone number are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/users', {
        action: 'updateProfile',
        data: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGameAccountChange = (game: 'pubg' | 'mlbb', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      gameAccounts: {
        ...prev.gameAccounts,
        [game]: {
          ...prev.gameAccounts[game],
          [field]: value
        }
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would upload the file to a storage service
    // and set the URL in the formData.profileImage field
    toast({
      title: "Image Upload",
      description: "In a production environment, this would upload the image to a storage service.",
    });
    
    // For demo purposes, we'll just show a placeholder
    handleInputChange('profileImage', 'https://placehold.co/200x200');
  };

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="profile-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  {formData.profileImage ? (
                    <img 
                      src={formData.profileImage} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <i className="fas fa-user text-2xl text-muted-foreground"></i>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="profile-image">Upload New Image</Label>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pi Username</Label>
                    <Input 
                      value={user?.username || ''} 
                      readOnly 
                      className="bg-muted cursor-not-allowed"
                      data-testid="pi-username"
                    />
                  </div>
                  <div>
                    <Label>Pi Wallet Address</Label>
                    <Input 
                      value={user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Not set'} 
                      readOnly 
                      className="bg-muted cursor-not-allowed font-mono text-sm"
                      data-testid="pi-wallet"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your-email@gmail.com"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label>Contact Number *</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        handleInputChange('phone', value);
                      }}
                      placeholder="+97517875099"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <div className="flex space-x-2">
                      <Select 
                        value={formData.country} 
                        onValueChange={(value: string) => handleInputChange('country', value)}
                      >
                        <SelectTrigger>
                          <div className="flex items-center">
                            {selectedCountry && (
                              <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                            )}
                            <SelectValue placeholder="Select country" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center">
                                <span className="mr-2 text-lg">{country.flag}</span>
                                {country.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCountrySelector(true)}
                        className="shrink-0"
                      >
                        <i className="fas fa-search"></i>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value: string) => handleInputChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Accounts */}
            <Card>
              <CardHeader>
                <CardTitle>Game Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* PUBG Mobile */}
                <div>
                  <div className="flex items-center mb-3">
                    <img 
                      src={GAME_LOGOS.PUBG} 
                      alt="PUBG Mobile" 
                      className="w-8 h-8 mr-2"
                    />
                    <h3 className="text-lg font-semibold">PUBG Mobile</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>In-Game Name (IGN)</Label>
                      <Input
                        value={formData.gameAccounts.pubg.ign}
                        onChange={(e) => handleGameAccountChange('pubg', 'ign', e.target.value)}
                        placeholder="Your PUBG IGN"
                        data-testid="pubg-ign"
                      />
                    </div>
                    <div>
                      <Label>Player UID</Label>
                      <Input
                        value={formData.gameAccounts.pubg.uid}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/\D/g, '');
                          handleGameAccountChange('pubg', 'uid', value);
                        }}
                        placeholder="Your PUBG UID"
                        className="font-mono"
                        data-testid="pubg-uid"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Legends */}
                <div>
                  <div className="flex items-center mb-3">
                    <img 
                      src={GAME_LOGOS.MLBB} 
                      alt="Mobile Legends" 
                      className="w-8 h-8 mr-2"
                    />
                    <h3 className="text-lg font-semibold">Mobile Legends</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>User ID</Label>
                      <Input
                        value={formData.gameAccounts.mlbb.userId}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/\D/g, '');
                          handleGameAccountChange('mlbb', 'userId', value);
                        }}
                        placeholder="Your MLBB User ID"
                        className="font-mono"
                        data-testid="mlbb-user-id"
                      />
                    </div>
                    <div>
                      <Label>Zone ID</Label>
                      <Input
                        value={formData.gameAccounts.mlbb.zoneId}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/\D/g, '');
                          handleGameAccountChange('mlbb', 'zoneId', value);
                        }}
                        placeholder="Your MLBB Zone ID"
                        className="font-mono"
                        data-testid="mlbb-zone-id"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Code */}
            <Card>
              <CardHeader>
                <CardTitle>Referral Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Referral Code</Label>
                  <Input
                    value={formData.referralCode}
                    onChange={(e) => handleInputChange('referralCode', e.target.value)}
                    placeholder="Enter referral code (if any)"
                    data-testid="input-referral-code"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Earn rewards by referring friends to B4U Esports
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="cancel-profile-edit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                data-testid="save-profile"
              >
                <i className="fas fa-save mr-2"></i>
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CountrySelector 
        isOpen={showCountrySelector} 
        onClose={() => setShowCountrySelector(false)} 
        onSelect={(countryCode: string) => handleInputChange('country', countryCode)}
        selectedCountry={formData.country}
      />
    </>
  );
}