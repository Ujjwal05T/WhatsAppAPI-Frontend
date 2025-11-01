'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Settings, LogOut, User, Key } from 'lucide-react';
import { useEffect, useState } from 'react';
import { User as UserType } from '@/lib/api';

interface NavigationProps {
  user?: UserType | null;
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();

  // const handleLogout = () => {
  //   localStorage.removeItem('authToken');
  //   localStorage.removeItem('apiKey');
  //   window.location.href = '/login';
  // };

  const isActive = (path: string) => pathname === path;

  if (!user) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Phone className="h-6 w-6" />
              <span className="text-xl font-bold">WhatsApp API</span>
            </Link>
            <div className="text-sm text-gray-500">Loading user data...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Phone className="h-6 w-6" />
              <span className="text-xl font-bold">WhatsApp API</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>

              <Link href="/accounts">
                <Button
                  variant={isActive('/accounts') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  My Accounts
                </Button>
              </Link>

              <Link href="/profile">
                <Button
                  variant={isActive('/profile') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>

              <Link href="/settings">
                <Button
                  variant={isActive('/settings') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user.mobile}</span>
              <Badge variant="secondary" className="text-xs">
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button> */}
          </div>
        </div>
      </div>
    </nav>
  );
}