import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, token } = usePiNetwork();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    country: 'Bhutan',
    language: 'en',
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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
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

    updateProfileMutation.mutate(formData);
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

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="profile-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Label>Country *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowCountrySelector(true)}
                      data-testid="country-selector-button"
                    >
                      {selectedCountry?.flag} {selectedCountry?.name}
                    </Button>
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger data-testid="language-select">
                        <SelectValue />
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
                <div className="p-4 bg-muted rounded-lg" data-testid="pubg-account">
                  <div className="flex items-center mb-4">
                    <img src={GAME_LOGOS.PUBG} alt="PUBG Mobile" className="w-8 h-8 mr-3" />
                    <h4 className="text-lg font-semibold">PUBG Mobile</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>In-Game Name (IGN)</Label>
                      <Input
                        value={formData.gameAccounts.pubg.ign}
                        onChange={(e) => handleGameAccountChange('pubg', 'ign', e.target.value)}
                        placeholder="ProGamer2025"
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
                        placeholder="5123456789"
                        className="font-mono"
                        data-testid="pubg-uid"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Legends */}
                <div className="p-4 bg-muted rounded-lg" data-testid="mlbb-account">
                  <div className="flex items-center mb-4">
                    <img src={GAME_LOGOS.MLBB} alt="Mobile Legends" className="w-8 h-8 mr-3" />
                    <h4 className="text-lg font-semibold">Mobile Legends: Bang Bang</h4>
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
                        placeholder="123456789"
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
                        placeholder="3002"
                        className="font-mono"
                        data-testid="mlbb-zone-id"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Code */}
            <div>
              <Label>Referral Code (Optional)</Label>
              <Input
                value={formData.referralCode}
                onChange={(e) => handleInputChange('referralCode', e.target.value)}
                placeholder="Enter referral code"
                data-testid="referral-code"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4 pt-6">
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
                disabled={updateProfileMutation.isPending}
                data-testid="save-profile"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Country Selector Modal */}
      <CountrySelector
        isOpen={showCountrySelector}
        onClose={() => setShowCountrySelector(false)}
        onSelect={(countryCode) => {
          handleInputChange('country', countryCode);
          setShowCountrySelector(false);
        }}
        selectedCountry={formData.country}
      />
    </>
  );
}
