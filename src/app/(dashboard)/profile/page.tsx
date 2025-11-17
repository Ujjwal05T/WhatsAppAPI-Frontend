'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, User, Key, Calendar, Shield, Activity } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { ProfileSkeleton } from '@/components/skeletons/dashboard-skeleton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ProfileData {
  user: {
    id: number;
    name: string;
    mobile: string;
    apiKey: string;
    role: string;
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

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Debug: Check what's in localStorage
    console.log('Checking for stored API keys...');
    console.log('apiKey from localStorage:', localStorage.getItem('apiKey'));
    console.log('authToken from localStorage:', localStorage.getItem('authToken'));

    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      console.log('Found stored API key:', storedApiKey);
      fetchProfileData(storedApiKey);
    } else {
      // Try to get API key from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const urlApiKey = urlParams.get('apiKey');
      console.log('URL API key:', urlApiKey);

      if (urlApiKey) {
        localStorage.setItem('apiKey', urlApiKey);
        fetchProfileData(urlApiKey);
      } else {
        // Check if we have an auth token that might be the API key
        const authToken = localStorage.getItem('authToken');
        console.log('Auth token:', authToken);

        if (authToken && authToken.startsWith('api_')) {
          console.log('Using auth token as API key');
          localStorage.setItem('apiKey', authToken);
          fetchProfileData(authToken);
        } else {
          setError('API key not found. Please login first.');
          setIsLoading(false);
        }
      }
    }
  }, []);

  const fetchProfileData = async (key: string) => {
    console.log('Fetching profile data with key:', key);
    try {
      const data = await authAPI.getProfile(key);
      console.log('Profile data received:', data);
      setProfileData(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      const error = err as { response?: { data?: { error?: string }; status?: number }; message?: string };
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      const errorMessage = error.response?.data?.error || error.message || 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (profileData?.user.apiKey) {
      try {
        await navigator.clipboard.writeText(profileData.user.apiKey);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
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

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/register'}
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const connectionRate = profileData.statistics.totalWhatsAppAccounts > 0
    ? Math.round((profileData.statistics.connectedWhatsAppAccounts / profileData.statistics.totalWhatsAppAccounts) * 100)
    : 0;

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your account and view your API key
        </p>
      </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{profileData.user.name}</CardTitle>
                  <CardDescription>{profileData.user.mobile}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={profileData.user.role === 'ADMIN' ? "destructive" : "secondary"}>
                  {profileData.user.role}
                </Badge>
                <Badge variant={profileData.user.isActive ? "default" : "secondary"}>
                  {profileData.user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{formatDate(profileData.user.createdAt)}</p>
                </div>
              </div>
              {profileData.user.lastLogin && (
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">{formatDate(profileData.user.lastLogin)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Key Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle>Your API Key</CardTitle>
                <CardDescription>
                  Use this key to authenticate API requests
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="p-4 bg-gray-100 rounded-lg font-mono text-sm break-all pr-20">
                {profileData.user.apiKey}
              </div>
              <Button
                onClick={copyToClipboard}
                className="absolute top-4 right-4"
                size="sm"
                variant="outline"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">How to use your API key:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Include it in the <code className="bg-yellow-100 px-1 rounded">X-API-Key</code> header for API requests</li>
                <li>• Keep it secure and never share it publicly</li>
                <li>• You can regenerate it if needed (contact support)</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Example usage:</h4>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`curl -X GET ${API_BASE_URL}/api/auth/profile \\
  -H "X-API-Key: ${profileData.user.apiKey}" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
          </CardContent>
        </Card>

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
                  {profileData.statistics.totalWhatsAppAccounts}
                </div>
                <p className="text-sm text-gray-600 mt-1">Total Accounts</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {profileData.statistics.connectedWhatsAppAccounts}
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

            {profileData.statistics.totalWhatsAppAccounts === 0 && (
              <div className="mt-6 text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 mb-3">
                  You haven&apos;t created any WhatsApp accounts yet. Get started by creating your first account!
                </p>
                <Button onClick={() => window.location.href = '/accounts'}>
                  Create Your First Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => window.location.href = '/accounts'}
            >
              Manage WhatsApp Accounts
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
            >
              View Dashboard
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                localStorage.removeItem('apiKey');
                window.location.href = '/login';
              }}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
    </>
  );
}