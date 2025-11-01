'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Plus, MessageSquare, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { whatsappAPI, authAPI } from '@/lib/api';
import { User, WhatsAppAccount } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<WhatsAppAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const userData = await authAPI.getCurrentUser();
      setUser(userData);

      // Fetch user accounts
      const [allAccounts, connected] = await Promise.all([
        whatsappAPI.getUserAccounts(userData.id),
        whatsappAPI.getConnectedAccounts(userData.id),
      ]);

      setAccounts(allAccounts);
      setConnectedAccounts(connected);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={null} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const connectionRate = accounts.length > 0
    ? Math.round((connectedAccounts.length / accounts.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.mobile || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your WhatsApp connections and monitor your API usage
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
              <p className="text-xs text-muted-foreground">
                WhatsApp accounts registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{connectedAccounts.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently active connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connectionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Accounts successfully connected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Badge variant={connectionRate > 50 ? "default" : "secondary"}>
                {connectionRate > 50 ? "Healthy" : "Needs Setup"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {connectionRate > 50 ? "✅" : "⚠️"}
              </div>
              <p className="text-xs text-muted-foreground">
                System status overview
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with these common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/accounts">
                <Button className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Manage WhatsApp Accounts
                </Button>
              </Link>

              {accounts.length === 0 && (
                <Link href="/accounts">
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Account
                  </Button>
                </Link>
              )}

              {connectedAccounts.length > 0 && (
                <Link href="/messages">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Messages
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Accounts</CardTitle>
              <CardDescription>
                Your latest WhatsApp account connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-4">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">No accounts yet</p>
                  <Link href="/accounts">
                    <Button size="sm">Create Account</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.slice(0, 3).map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {account.phoneNumber || 'Not Connected'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {account.whatsappName || 'Waiting for connection'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={account.isConnected ? "default" : "secondary"}>
                        {account.isConnected ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Disconnected
                          </>
                        )}
                      </Badge>
                    </div>
                  ))}

                  {accounts.length > 3 && (
                    <Link href="/accounts">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Accounts ({accounts.length})
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        {connectedAccounts.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Follow these steps to set up your WhatsApp API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Create Account</h3>
                  <p className="text-sm text-gray-600">
                    Generate a WhatsApp account token to get started
                  </p>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h3 className="font-medium mb-2">Connect WhatsApp</h3>
                  <p className="text-sm text-gray-600">
                    Scan the QR code with your WhatsApp mobile app
                  </p>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Send Messages</h3>
                  <p className="text-sm text-gray-600">
                    Use the API to send messages programmatically
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href="/accounts">
                  <Button size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}