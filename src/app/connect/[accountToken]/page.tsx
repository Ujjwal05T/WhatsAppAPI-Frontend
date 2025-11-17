'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, RefreshCw, CheckCircle, ArrowLeft, Smartphone, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ConnectSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { copyToClipboard as copyText } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ConnectPage() {
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

  useEffect(() => {
    if (!accountToken) {
      router.push('/accounts');
      return;
    }

    fetchQRCode();

    // Set up status checking interval
    const statusInterval = setInterval(() => {
      checkConnectionStatus();
    }, 3000);

    // Set up QR code refresh interval (refresh every 50 seconds)
    // WhatsApp QR codes expire after 60 seconds
    const qrRefreshInterval = setInterval(() => {
      if (!isConnected) {
        console.log('Auto-refreshing QR code...');
        fetchQRCode();
        setQrExpiresIn(50); // Reset countdown
      }
    }, 50000);

    // Countdown timer for QR expiration
    const countdownInterval = setInterval(() => {
      if (!isConnected) {
        setQrExpiresIn(prev => {
          if (prev <= 1) return 50; // Reset when it hits 0
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
        setError(''); // Clear any previous errors
      } else if (data.message) {
        // QR code is being generated
        console.log(data.message);
        // Retry after a short delay
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
        toast.success('WhatsApp account connected successfully!');

        // Log account token to console for easy access
        console.log('================================================');
        console.log('🎉 WHATSAPP ACCOUNT CONNECTED!');
        console.log('================================================');
        console.log('📋 Account Token:', accountToken);
        console.log('🔑 Use this token to send messages');
        console.log('================================================');
      }
    } catch (err) {
      // Don't show error for status checks, just continue trying
      console.error('Status check failed:', err);
    }
  };

  const refreshQRCode = async () => {
    setIsRefreshing(true);
    try {
      await fetchQRCode();
      setQrExpiresIn(50); // Reset countdown on manual refresh
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
                <CardTitle className="text-green-800">Connection Successful!</CardTitle>
                <CardDescription className="text-green-700">
                  Your WhatsApp account has been connected successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
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
                          console.log('📋 Account Token:', accountToken);
                        } catch (err) {
                          console.error('Failed to copy:', err);
                          toast.error('Failed to copy token');
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Save this token - you&apos;ll need it to send messages
                  </p>
                </div>

                <p className="text-green-700">
                  Your WhatsApp account is now ready to send messages!
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
                    <QrCode className="h-5 w-5 mr-2" />
                    Connect WhatsApp Account
                  </CardTitle>
                  <CardDescription>
                    Scan this QR code with your WhatsApp mobile app to connect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-6">
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">How to connect:</h3>
                      <ol className="text-sm text-blue-800 space-y-1 text-left max-w-md mx-auto">
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