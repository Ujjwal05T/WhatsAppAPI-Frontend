'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, RefreshCw, CheckCircle, ArrowLeft, Smartphone, Clock, Link2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConnectSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { copyToClipboard as copyText } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RelinkPage() {
  const params = useParams();
  const router = useRouter();
  const accountToken = params.accountToken as string;

  const [qrCode, setQrCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statusChecks, setStatusChecks] = useState(0);
  const [qrExpiresIn, setQrExpiresIn] = useState(50);
  const [accountInfo, setAccountInfo] = useState<{
    phoneNumber?: string;
    whatsappName?: string;
  }>({});

  useEffect(() => {
    if (!accountToken) {
      router.push('/accounts');
      return;
    }

    fetchAccountInfo();
    fetchQRCode();

    // Set up status checking interval
    const statusInterval = setInterval(() => {
      checkConnectionStatus();
    }, 3000);

    // Set up QR code refresh interval (refresh every 50 seconds)
    const qrRefreshInterval = setInterval(() => {
      if (!isConnected) {
        console.log('Auto-refreshing QR code...');
        fetchQRCode();
        setQrExpiresIn(50);
      }
    }, 50000);

    // Countdown timer for QR expiration
    const countdownInterval = setInterval(() => {
      if (!isConnected) {
        setQrExpiresIn(prev => {
          if (prev <= 1) return 50;
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(qrRefreshInterval);
      clearInterval(countdownInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountToken, isConnected]);

  const fetchAccountInfo = async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) return;

      const response = await fetch(`${API_BASE_URL}/api/whatsapp/status/${accountToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccountInfo({
          phoneNumber: data.phoneNumber,
          whatsappName: data.whatsappName
        });
      }
    } catch (err) {
      console.error('Failed to fetch account info:', err);
    }
  };

  const fetchQRCode = async () => {
    if (!accountToken) return;

    try {
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) {
        setError('No API key found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/whatsapp/qr/${accountToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch QR code: ${response.status}`);
      }

      const data = await response.json();

      if (data.qrCode) {
        setQrCode(data.qrCode);
        setIsConnected(data.isConnected || false);
        setError('');
      } else if (data.message) {
        console.log(data.message);
        setTimeout(() => fetchQRCode(), 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch QR code';
      setError(errorMessage);
      console.error('QR fetch error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    if (!accountToken || isConnected) return;

    try {
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) return;

      const response = await fetch(`${API_BASE_URL}/api/whatsapp/status/${accountToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      });

      if (!response.ok) {
        console.error('Status check failed:', response.status);
        return;
      }

      const data = await response.json();
      setStatusChecks(prev => prev + 1);

      if (data.isConnected) {
        setIsConnected(true);
        setQrCode('');
        toast.success('WhatsApp account reconnected successfully!');

        console.log('================================================');
        console.log('🎉 WHATSAPP ACCOUNT RECONNECTED!');
        console.log('================================================');
        console.log('📋 Account Token:', accountToken);
        console.log('📱 Phone:', data.phoneNumber);
        console.log('👤 Name:', data.whatsappName);
        console.log('================================================');
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  };

  const refreshQRCode = async () => {
    setIsRefreshing(true);
    try {
      await fetchQRCode();
      setQrExpiresIn(50);
      toast.success('QR code refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatAccountToken = (token: string) => {
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  };

  if (isLoading) {
    return <ConnectSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Navigation */}
          <Link href="/accounts" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Accounts
          </Link>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isConnected ? (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-green-800">Reconnection Successful!</CardTitle>
                <CardDescription className="text-green-700">
                  Your WhatsApp account has been reconnected successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {/* Account Info Display */}
                {accountInfo.phoneNumber && (
                  <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">Account Details:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="font-semibold">{accountInfo.phoneNumber}</span>
                      </div>
                      {accountInfo.whatsappName && (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="font-semibold">{accountInfo.whatsappName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Token Display */}
                <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Your Account Token:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-sm font-mono bg-gray-100 px-3 py-2 rounded break-all">
                      {accountToken}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await copyText(accountToken);
                          toast.success('Account token copied to clipboard!');
                        } catch (err) {
                          console.error('Failed to copy:', err);
                          toast.error('Failed to copy token');
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <p className="text-green-700">
                  Your WhatsApp account is now ready to send messages again!
                </p>

                <Link href="/accounts">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Go to Accounts
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Link2 className="h-5 w-5 mr-2" />
                    Relink WhatsApp Account
                  </CardTitle>
                  <CardDescription>
                    Scan this QR code with your WhatsApp mobile app to reconnect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-6">
                    {/* Previous Account Info */}
                    {accountInfo.phoneNumber && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-medium text-blue-900">Previously Connected Account</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-blue-800">
                            Phone: <span className="font-semibold">{accountInfo.phoneNumber}</span>
                          </p>
                          {accountInfo.whatsappName && (
                            <p className="text-sm text-blue-800">
                              Name: <span className="font-semibold">{accountInfo.whatsappName}</span>
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          Scan the QR code below with the same WhatsApp account
                        </p>
                      </div>
                    )}

                    {/* Account Token Display */}
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Account Token:</p>
                      <p className="font-mono text-sm">{formatAccountToken(accountToken)}</p>
                    </div>

                    {/* QR Code Display */}
                    {qrCode ? (
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                          <img
                            src={qrCode}
                            alt="WhatsApp QR Code"
                            className="w-64 h-64"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="bg-gray-100 p-16 rounded-lg">
                          <QrCode className="h-16 w-16 text-gray-400" />
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-yellow-900 mb-2">How to reconnect:</h3>
                      <ol className="text-sm text-yellow-800 space-y-1 text-left max-w-md mx-auto">
                        <li>1. Open WhatsApp on your phone</li>
                        <li>2. Go to Settings &gt; Linked Devices</li>
                        <li>3. Tap &quot;Link a device&quot;</li>
                        <li>4. Scan the QR code above</li>
                      </ol>
                    </div>

                    {/* Status and Refresh */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          Checking connection status... (Check #{statusChecks})
                        </p>
                      </div>

                      <div className="flex justify-center space-x-3">
                        <Button
                          variant="outline"
                          onClick={refreshQRCode}
                          disabled={isRefreshing}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                          {isRefreshing ? 'Refreshing...' : 'Refresh QR Code'}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={checkConnectionStatus}
                          disabled={isConnected}
                        >
                          Check Status
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <Smartphone className="h-3 w-3" />
                      <span>QR code auto-refreshes in {qrExpiresIn} seconds</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
