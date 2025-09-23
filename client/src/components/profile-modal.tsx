import { useState, useEffect, useRef } from 'react';
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
    country: 'BT', // Bhutan as default
    language: 'en',
    gameAccounts: {
      pubg: { ign: '', uid: '' },
      mlbb: { userId: '', zoneId: '' }
    },
    referralCode: '',
    selectedGames: ['pubg', 'mlbb'] // Track which games the user plays
  });

  const [showCountrySelector, setShowCountrySelector] = useState(false);

  // Country code mapping
  const countryCodes: Record<string, string> = {
    'BT': '+975',
    'IN': '+91',
    'US': '+1',
    'GB': '+44',
    'CA': '+1',
    'AU': '+61',
    'DE': '+49',
    'FR': '+33',
    'JP': '+81',
    'KR': '+82',
    'SG': '+65',
    'MY': '+60',
    'TH': '+66',
    'ID': '+62',
    'PH': '+63',
    'VN': '+84'
  };

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with user data including profile image
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || 'BT',
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
        referralCode: user.referralCode || '',
        selectedGames: [
          user.gameAccounts?.pubg ? 'pubg' : null,
          user.gameAccounts?.mlbb ? 'mlbb' : null
        ].filter(Boolean) as string[]
      });
      
      // Set profile image URL if available
      if ((user as any).profileImageUrl) {
        setProfileImageUrl((user as any).profileImageUrl);
      }
    }
  }, [user, isOpen]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create FormData for file upload if profile image is selected
      const formDataToSend = new FormData();
      
      // Append text data as JSON strings
      Object.keys(data).forEach(key => {
        if (key !== 'profileImage') {
          // For nested objects like gameAccounts, send as JSON string
          if (typeof data[key] === 'object' && data[key] !== null) {
            formDataToSend.append(key, JSON.stringify(data[key]));
          } else {
            // For primitive values, send as string
            formDataToSend.append(key, String(data[key]));
          }
        }
      });
      
      // Append profile image if selected
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }
      
      const response = await fetch('/api/profile', {
        method: 'PUT',  
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Profile update failed';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
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

    // Add isProfileVerified flag when profile is completed (if not already set)
    const profileData = {
      ...formData,
      isProfileVerified: (user as any)?.isProfileVerified || true // Keep existing status or set to true if completing
    };

    updateProfileMutation.mutate(profileData);
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

  const handleGameSelection = (game: string) => {
    setFormData(prev => {
      const selectedGames = prev.selectedGames.includes(game)
        ? prev.selectedGames.filter(g => g !== game)
        : [...prev.selectedGames, game];
      
      return {
        ...prev,
        selectedGames
      };
    });
  };

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country);
  const countryCode = countryCodes[formData.country] || '+975'; // Default to Bhutan

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
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {profileImageUrl ? (
                      <img 
                        src={profileImageUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-primary">
                        <i className="fas fa-user text-2xl text-muted-foreground"></i>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-white"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {profileImage ? 'Change Image' : 'Upload Image'}
                    </Button>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProfileImage(file);
                          // Create preview URL
                          const url = URL.createObjectURL(file);
                          setProfileImageUrl(url);
                        }
                      }}
                    />
                    {profileImageUrl && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="ml-2"
                        onClick={() => {
                          setProfileImage(null);
                          setProfileImageUrl(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Optional. JPG, PNG, or GIF. Max 2MB.
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
                    <Label>Contact Number *</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.country} 
                        onValueChange={(value) => {
                          handleInputChange('country', value);
                          // Reset phone number when country changes
                          setFormData(prev => ({
                            ...prev,
                            phone: ''
                          }));
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.flag} {countryCodes[country.code] || '+975'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/\D/g, '');
                          handleInputChange('phone', value);
                        }}
                        placeholder="Enter phone number"
                        className="flex-1 font-mono"
                        data-testid="input-phone"
                      />
                    </div>
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

            {/* Game Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Game Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.selectedGames.includes('pubg') ? "default" : "outline"}
                    onClick={() => handleGameSelection('pubg')}
                    className="flex items-center gap-2"
                  >
                    <img src={GAME_LOGOS.PUBG} alt="PUBG Mobile" className="w-6 h-6" />
                    PUBG Mobile
                  </Button>
                  <Button
                    type="button"
                    variant={formData.selectedGames.includes('mlbb') ? "default" : "outline"}
                    onClick={() => handleGameSelection('mlbb')}
                    className="flex items-center gap-2"
                  >
                    <img src={GAME_LOGOS.MLBB} alt="Mobile Legends" className="w-6 h-6" />
                    Mobile Legends
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select the games you play. You can add game accounts for selected games below.
                </p>
              </CardContent>
            </Card>

            {/* Game Accounts */}
            <Card>
              <CardHeader>
                <CardTitle>Game Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* PUBG Mobile - Only show if selected */}
                {formData.selectedGames.includes('pubg') && (
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
                )}

                {/* Mobile Legends - Only show if selected */}
                {formData.selectedGames.includes('mlbb') && (
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
                )}

                {formData.selectedGames.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Select games above to add your game accounts</p>
                  </div>
                )}
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