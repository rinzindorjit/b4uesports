import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ParticleBackground from '@/components/particle-background';

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleBackground />
      <Navigation isTestnet={typeof process !== 'undefined' && process.env.NODE_ENV === 'development'} />
      
      {/* Admin Header */}
      <div className="bg-red-900/20 border-b border-red-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Access Disabled</h1>
              <p className="text-muted-foreground">Admin functionality has been removed as requested</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-amber-500/20 border border-amber-500 rounded-lg">
              <p className="text-sm text-amber-300">
                <i className="fas fa-info-circle mr-2"></i>
                The admin panel functionality has been completely removed as requested. 
                Please contact the system administrator if you need access to administrative features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
