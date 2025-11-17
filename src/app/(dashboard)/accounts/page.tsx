'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Shield, Plus, Phone, QrCode, RefreshCw, Copy, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AccountsSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  const [deletingAccountToken, setDeletingAccountToken] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);

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
      const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
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
        fetch(`${API_BASE_URL}/api/whatsapp/accounts/${profileData.user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': storedApiKey
          }
        }),
        fetch(`${API_BASE_URL}/api/whatsapp/connected/${profileData.user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': storedApiKey
          }
        })
      ]);

      if (accountsResponse.ok && connectedResponse.ok) {
        const allAccountsData: { success: boolean; accounts: WhatsAppAccount[] } = await accountsResponse.json();
        const connectedData: { success: boolean; accounts: WhatsAppAccount[] } = await connectedResponse.json();
        setAccounts(allAccountsData.accounts || []);
        setConnectedAccounts(connectedData.accounts || []);
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
      console.log('Creating account for user:', user.id);
      console.log('API Key:', apiKey ? 'Present' : 'Missing');

      const response = await fetch(`${API_BASE_URL}/api/whatsapp/create-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ userId: user.id })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Failed to create account: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success response:', data);

      if (!data.account || !data.account.accountToken) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from server: missing account token');
      }

      toast.success('Account created successfully!', {
        description: 'Redirecting to QR code scanner...'
      });

      setTimeout(() => {
        window.location.href = `/connect/${data.account.accountToken}`;
      }, 1000);
    } catch (err: any) {
      console.error('Failed to create account:', err);
      toast.error('Failed to create account', {
        description: err.message || 'Unknown error occurred'
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const checkConnectionStatus = async (accountToken: string) => {
    setCheckingStatus(accountToken);
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/status/${accountToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isConnected) {
          toast.success('Account is connected!', {
            description: `${data.phoneNumber || 'WhatsApp'} is active`
          });
          fetchUserData(); // Refresh data
        } else {
          toast.info('Account is not connected', {
            description: 'Please scan the QR code to connect'
          });
        }
      } else {
        toast.error('Failed to check status');
      }
    } catch (err) {
      console.error('Failed to check status:', err);
      toast.error('Failed to check connection status');
    } finally {
      setCheckingStatus(null);
    }
  };

  const copyTokenToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success('Token copied to clipboard!', {
        description: 'You can now use this token in your API requests'
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy token');
    }
  };

  const deleteAccount = async (accountToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/account/${accountToken}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      });

      if (response.ok) {
        toast.success('Account deleted successfully!');
        fetchUserData(); // Refresh list
      } else {
        const data = await response.json();
        toast.error('Failed to delete account', {
          description: data.error || 'Unknown error'
        });
      }
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      toast.error('Failed to delete account');
    } finally {
      setDeletingAccountToken(null);
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
    return <AccountsSkeleton />;
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
          <Button onClick={createNewAccount} disabled={isCreatingAccount} className="shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingAccount ? 'Creating...' : 'Add New Account'}
          </Button>
        </div>

        {/* Statistics Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your WhatsApp API usage overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900">
                  {accounts.length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Total Accounts</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {connectedAccounts.length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Connected</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {connectionRate}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Success Rate</p>
              </div>
            </div>

            {accounts.length === 0 && (
              <div className="mt-6 text-center p-6 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                <Phone className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <p className="text-blue-800 font-medium mb-2">No accounts yet</p>
                <p className="text-blue-600 text-sm mb-4">
                  Get started by creating your first WhatsApp account!
                </p>
                <Button onClick={createNewAccount} className="shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounts List */}
        {accounts.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Your WhatsApp Accounts ({accounts.length})</CardTitle>
              <CardDescription>Click on any account to view details and manage settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <Card key={account.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <CardTitle className="text-base font-semibold">
                              {account.phoneNumber || 'Not Connected'}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-sm">
                            {account.whatsappName || 'Waiting for connection...'}
                          </CardDescription>
                        </div>
                        <Badge variant={account.isConnected ? "default" : "secondary"} className="ml-2">
                          {account.isConnected ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Token Section */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 font-medium">Account Token</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => copyTokenToClipboard(account.accountToken)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs font-mono text-gray-700 bg-white p-2 rounded border">
                          {formatAccountToken(account.accountToken)}
                        </p>
                      </div>

                      {/* Created Date */}
                      <div className="flex items-center text-xs text-gray-600">
                        <span className="font-medium">Created:</span>
                        <span className="ml-2">{formatDate(account.createdAt)}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {!account.isConnected && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => window.location.href = `/connect/${account.accountToken}`}
                          >
                            <QrCode className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => checkConnectionStatus(account.accountToken)}
                          disabled={checkingStatus === account.accountToken}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${checkingStatus === account.accountToken ? 'animate-spin' : ''}`} />
                          {checkingStatus === account.accountToken ? 'Checking...' : 'Check'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingAccountToken(account.accountToken)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAccountToken} onOpenChange={() => setDeletingAccountToken(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete WhatsApp Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this WhatsApp account? This action cannot be undone.
              You will need to reconnect by scanning a new QR code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingAccountToken && deleteAccount(deletingAccountToken)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
