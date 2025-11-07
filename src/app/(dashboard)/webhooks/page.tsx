'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Webhook, Plus, CheckCircle, XCircle, Settings, Send, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI, whatsappAPI } from '@/lib/api';

interface WebhookData {
  id: number;
  url: string;
  isActive: boolean;
  events: string[];
  createdAt: string;
  updatedAt: string;
}

interface WhatsAppAccount {
  id: number;
  accountToken: string;
  phoneNumber?: string;
  whatsappName?: string;
  isConnected: boolean;
}

export default function WebhooksPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [webhookData, setWebhookData] = useState({
    url: '',
    secret: '',
    events: ['message.received']
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) {
        window.location.href = '/login';
        return;
      }

      const userData = await authAPI.getCurrentUser();
      setUser(userData);

      // Fetch WhatsApp accounts
      const userAccounts = await whatsappAPI.getUserAccounts(userData.id);
      setAccounts(userAccounts);

      if (userAccounts.length > 0) {
        setSelectedAccount(userAccounts[0].accountToken);
        await fetchWebhooks(userAccounts[0].accountToken, apiKey);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebhooks = async (accountToken: string, apiKey: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/webhooks/${accountToken}`, {
        headers: { 'X-API-Key': apiKey || '' }
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    }
  };

  const handleAccountChange = async (accountToken: string) => {
    setSelectedAccount(accountToken);
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      await fetchWebhooks(accountToken, apiKey);
    }
  };

  const registerWebhook = async () => {
    if (!selectedAccount || !webhookData.url) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsRegistering(true);
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch('http://localhost:5000/api/webhooks/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey || ''
        },
        body: JSON.stringify({
          accountToken: selectedAccount,
          url: webhookData.url,
          secret: webhookData.secret || undefined,
          events: webhookData.events
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Webhook registered successfully!');
        setShowRegisterDialog(false);
        setWebhookData({ url: '', secret: '', events: ['message.received'] });
        await fetchWebhooks(selectedAccount, apiKey!);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to register webhook');
      }
    } catch (error) {
      console.error('Error registering webhook:', error);
      toast.error('Failed to register webhook');
    } finally {
      setIsRegistering(false);
    }
  };

  const toggleWebhook = async (webhookId: number, isActive: boolean) => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch(`http://localhost:5000/api/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey || ''
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        toast.success(`Webhook ${isActive ? 'enabled' : 'disabled'} successfully`);
        await fetchWebhooks(selectedAccount, apiKey!);
      }
    } catch (error) {
      toast.error('Failed to update webhook');
    }
  };

  const deleteWebhook = async (webhookId: number) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch(`http://localhost:5000/api/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey || '' }
      });

      if (response.ok) {
        toast.success('Webhook deleted successfully');
        await fetchWebhooks(selectedAccount, apiKey!);
      }
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  };

  const testWebhook = async (webhookId: number) => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch(`http://localhost:5000/api/webhooks/${webhookId}/test`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey || '' }
      });

      if (response.ok) {
        toast.success('Test webhook sent successfully');
      }
    } catch (error) {
      toast.error('Failed to send test webhook');
    }
  };

  const copyAccountToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Account token copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  const connectedAccounts = accounts.filter(account => account.isConnected);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Webhooks</h1>
      </div>

      {/* Account Selection */}
      {connectedAccounts.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Select WhatsApp Account</CardTitle>
            <CardDescription>
              Choose which WhatsApp account's webhooks to manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedAccount} onValueChange={handleAccountChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {connectedAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.accountToken}>
                    {account.phoneNumber || account.whatsappName || 'Unnamed Account'}
                    {account.isConnected && ' ✅'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {connectedAccounts.length === 0 && (
        <Alert className="mb-6">
          <AlertDescription>
            No connected WhatsApp accounts found. Please connect a WhatsApp account first to set up webhooks.
          </AlertDescription>
        </Alert>
      )}

      {/* Account Info */}
      {selectedAccount && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Current Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Account Token:</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{selectedAccount}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyAccountToken(selectedAccount)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Badge variant={connectedAccounts.find(a => a.accountToken === selectedAccount) ? "default" : "secondary"}>
                {connectedAccounts.find(a => a.accountToken === selectedAccount) ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Register New Webhook */}
      {connectedAccounts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Register New Webhook
            </CardTitle>
            <CardDescription>
              Set up a webhook to receive real-time notifications for incoming WhatsApp messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register New Webhook</DialogTitle>
                  <DialogDescription>
                    Enter your webhook URL to receive incoming messages
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="url">Webhook URL *</Label>
                    <Input
                      id="url"
                      placeholder="https://your-server.com/whatsapp-webhook"
                      value={webhookData.url}
                      onChange={(e) => setWebhookData(prev => ({ ...prev, url: e.target.value }))}
                      className='my-2'
                    />
                  </div>
                  <div>
                    <Label htmlFor="secret">Secret Key (Optional)</Label>
                    <Input
                      id="secret"
                      type="password"
                      placeholder="your_secret_key_for_verification"
                      value={webhookData.secret}
                      onChange={(e) => setWebhookData(prev => ({ ...prev, secret: e.target.value }))}
                      className='my-2'
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for webhook signature verification
                    </p>
                  </div>
                  <div>
                    <Label>Events</Label>
                    <div className="flex gap-2 mt-2">
                      {['message.received'].map((event) => (
                        <Badge
                          key={event}
                          variant={webhookData.events.includes(event) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setWebhookData(prev => ({
                              ...prev,
                              events: prev.events.includes(event)
                                ? prev.events.filter(e => e !== event)
                                : [...prev.events, event]
                            }));
                          }}
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={registerWebhook}
                    disabled={isRegistering || !webhookData.url}
                    className="w-full"
                  >
                    {isRegistering ? 'Registering...' : 'Register Webhook'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Webhooks List */}
      {selectedAccount && webhooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Registered Webhooks ({webhooks.length})</span>
            </CardTitle>
            <CardDescription>
              Manage your webhook endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">Webhook Endpoint</h3>
                        <Badge variant={webhook.isActive ? "default" : "secondary"}>
                          {webhook.isActive ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm block mb-2 break-all">
                        {webhook.url}
                      </code>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Events:</span>
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(webhook.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testWebhook(webhook.id)}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleWebhook(webhook.id, !webhook.isActive)}
                      >
                        {webhook.isActive ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedAccount && webhooks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Webhook className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No webhooks registered</h3>
            <p className="text-gray-600 mb-4">
              Register your first webhook to start receiving incoming WhatsApp messages
            </p>
            <Button onClick={() => setShowRegisterDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Webhook
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">1.</span>
              <div>
                <strong>Create a webhook endpoint</strong> on your server that handles POST requests
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">2.</span>
              <div>
                <strong>Register your webhook URL</strong> above
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">3.</span>
              <div>
                <strong>Test it</strong> using the Test button - you'll receive a test message
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-1">4.</span>
              <div>
                <strong>Start building automation!</strong> Check the webhook documentation
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.open('/WEBHOOKS.md', '_blank')}
          >
            View Full Documentation
          </Button>
        </CardContent>
      </Card>
    </>
  );
}