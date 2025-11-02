'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Shield, Plus, Phone, QrCode, RefreshCw } from 'lucide-react';

interface ProfileData {
  user: {
    id: number;
    mobile: string;
    apiKey: string;
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
  };
  statistics: {
    totalWhatsAppAccounts: number;
    connectedWhatsAppAccounts: number;
    lastLogin?: string;
  };
}

interface WhatsAppAccount {
  id: number;
  userId: number;
  accountToken: string;
  phoneNumber?: string;
  whatsappName?: string;
  isConnected: boolean;
  createdAt: string;
}

export default function AccountsPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<WhatsAppAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [error, setError] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedApiKey = localStorage.getItem('apiKey');
      if (!storedApiKey) {
        setError('No API key found. Please login first.');
        setIsLoading(false);
        return;
      }

      setApiKey(storedApiKey);

      // Simple fetch without axios
      const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': storedApiKey
        }
      });

      if (!profileResponse.ok) {
        throw new Error(`Profile API failed: ${profileResponse.status}`);
      }

      const profileData: ProfileData = await profileResponse.json();
      setUser(profileData.user);

      // Fetch WhatsApp accounts
      const [accountsResponse, connectedResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/whatsapp/accounts/${profileData.user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': storedApiKey
          }
        }),
        fetch(`http://localhost:5000/api/whatsapp/connected/${profileData.user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': storedApiKey
          }
        })
      ]);

      if (accountsResponse.ok && connectedResponse.ok) {
        const allAccounts: WhatsAppAccount[] = await accountsResponse.json();
        const connected: WhatsAppAccount[] = await connectedResponse.json();
        setAccounts(allAccounts);
        setConnectedAccounts(connected);
      } else {
        console.warn('Failed to fetch some account data');
      }

    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewAccount = async () => {
    if (!user) return;

    setIsCreatingAccount(true);
    try {
      const response = await fetch('http://localhost:5000/api/whatsapp/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        throw new Error(`Failed to create account: ${response.status}`);
      }

      const data = await response.json();
      window.location.href = `/connect/${data.accountToken}`;
    } catch (err: any) {
      console.error('Failed to create account:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const checkConnectionStatus = async (accountToken: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/whatsapp/status/${accountToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isConnected) {
          fetchUserData(); // Refresh data
        }
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAccountToken = (token: string) => {
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('apiKey');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
            <Button variant="outline" className="w-full" onClick={fetchUserData}>
              Retry
            </Button>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const connectionRate = accounts.length > 0
    ? Math.round((connectedAccounts.length / accounts.length) * 100)
    : 0;

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Accounts</h1>
        <p className="text-gray-600 mt-2">Manage your WhatsApp connections</p>
      </div>

        {/* Create Account Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={createNewAccount} disabled={isCreatingAccount}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingAccount ? 'Creating...' : 'Add New Account'}
          </Button>
        </div>

        {/* Statistics Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your WhatsApp API usage overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {accounts.length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Total Accounts</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {connectedAccounts.length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Connected</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {connectionRate}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Success Rate</p>
              </div>
            </div>

            {accounts.length === 0 && (
              <div className="mt-6 text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 mb-3">
                  You haven't created any WhatsApp accounts yet. Get started by creating your first account!
                </p>
                <Button onClick={createNewAccount}>
                  Create Your First Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle>Your WhatsApp Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounts Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first WhatsApp account to get started
                </p>
                <Button onClick={createNewAccount}>
                  Create Account
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <Card key={account.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {account.phoneNumber || 'Not Connected'}
                        </CardTitle>
                        <Badge variant={account.isConnected ? "default" : "secondary"}>
                          {account.isConnected ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <span className="h-3 w-3 mr-1">○</span>
                          )}
                          {account.isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {account.whatsappName || 'Waiting for connection...'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-600">
                            Token: {formatAccountToken(account.accountToken)}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(account.accountToken);
                              console.log('📋 Account Token copied:', account.accountToken);
                              alert('Token copied to clipboard!');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Copy Full Token
                          </button>
                        </div>
                        <p className="text-gray-600">
                          Created: {formatDate(account.createdAt)}
                        </p>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        {!account.isConnected && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/connect/${account.accountToken}`}
                          >
                            <QrCode className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => checkConnectionStatus(account.accountToken)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Check
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </>
  );
}