'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QrCode, RefreshCw, CheckCircle, Smartphone, Clock, Copy } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface QRConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountToken: string;
  onSuccess?: () => void;
}

export function QRConnectionDialog({
  open,
  onOpenChange,
  accountToken,
  onSuccess,
}: QRConnectionDialogProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrExpiresIn, setQrExpiresIn] = useState(50);
  const [statusChecks, setStatusChecks] = useState(0);

  useEffect(() => {
    if (!open || !accountToken) return;

    fetchQRCode();

    // Status checking interval
    const statusInterval = setInterval(() => {
      checkConnectionStatus();
    }, 3000);

    // QR refresh interval (every 50 seconds)
    const qrRefreshInterval = setInterval(() => {
      if (!isConnected) {
        fetchQRCode();
        setQrExpiresIn(50);
      }
    }, 50000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      if (!isConnected) {
        setQrExpiresIn((prev) => {
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
  }, [open, accountToken, isConnected]);

  const fetchQRCode = async () => {
    setIsLoading(true);
    try {
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) return;

      const response = await fetch(`${API_BASE_URL}/api/whatsapp/qr/${accountToken}`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch QR code');

      const data = await response.json();

      if (data.qrCode) {
        setQrCode(data.qrCode);
        setIsConnected(data.isConnected || false);
      } else if (data.message) {
        setTimeout(() => fetchQRCode(), 3000);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch QR code');
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
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      setStatusChecks((prev) => prev + 1);

      if (data.isConnected) {
        setIsConnected(true);
        setQrCode('');
        toast.success('WhatsApp account connected successfully!');
        if (onSuccess) onSuccess();

        // Close dialog after 2 seconds
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
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

  const copyAccountToken = () => {
    navigator.clipboard.writeText(accountToken);
    toast.success('Account token copied!');
  };

  const progressPercentage = ((50 - qrExpiresIn) / 50) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Connect WhatsApp Account
          </DialogTitle>
          <DialogDescription>
            Scan this QR code with WhatsApp to connect your account
          </DialogDescription>
        </DialogHeader>

        {isConnected ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 slide-in-bottom">
            <div className="bg-green-100 p-6 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Connected Successfully!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your WhatsApp account is now ready to use
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
              <p className="text-xs text-green-700 mb-2 font-medium">Account Token:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-white px-2 py-1 rounded flex-1 break-all">
                  {accountToken}
                </code>
                <Button size="sm" variant="ghost" onClick={copyAccountToken}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* QR Code Display */}
            <div className="flex justify-center">
              {isLoading ? (
                <div className="bg-gray-100 p-16 rounded-lg">
                  <RefreshCw className="h-16 w-16 text-gray-400 animate-spin" />
                </div>
              ) : qrCode ? (
                <div className="bg-white p-4 rounded-lg shadow-lg card-hover">
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                </div>
              ) : (
                <div className="bg-gray-100 p-16 rounded-lg">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {!isConnected && qrCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>QR Code expires in {qrExpiresIn}s</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1" />
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                How to connect:
              </h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="font-medium mr-2">1.</span>
                  <span>Open WhatsApp on your phone</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">2.</span>
                  <span>Go to Settings → Linked Devices</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">3.</span>
                  <span>Tap &quot;Link a device&quot;</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">4.</span>
                  <span>Scan the QR code above</span>
                </li>
              </ol>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Checking status... (#{statusChecks})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshQRCode}
                disabled={isRefreshing}
                className="btn-animate"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
