import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AdminLoginModalProps {
  onLogin: (token: string) => void;
}

export default function AdminLoginModal({ onLogin }: AdminLoginModalProps) {
  return (
    <Card className="w-full max-w-md mx-4" data-testid="admin-login-modal">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-shield-alt text-2xl text-white"></i>
        </div>
        <CardTitle className="text-2xl">Admin Access Disabled</CardTitle>
        <p className="text-muted-foreground">Admin login functionality has been removed as requested</p>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-amber-500/20 border border-amber-500 rounded-lg">
          <p className="text-sm text-amber-300">
            <i className="fas fa-info-circle mr-2"></i>
            Admin access has been disabled. Please contact the system administrator if you need access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
