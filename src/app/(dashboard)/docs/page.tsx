'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, Code, Rocket } from 'lucide-react';

export default function DocsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">API Documentation</h1>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-full">
                <BookOpen className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Coming Soon</CardTitle>
            <CardDescription className="text-lg">
              Comprehensive API documentation is on its way!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-gray-600">
              We're working hard to create detailed documentation for you.
              In the meantime, here's what you can expect:
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Code Examples</h3>
                <p className="text-sm text-gray-600">
                  Sample code in multiple languages
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">API Reference</h3>
                <p className="text-sm text-gray-600">
                  Complete endpoint documentation
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Rocket className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Quick Start</h3>
                <p className="text-sm text-gray-600">
                  Get up and running in minutes
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-900 mb-2">Quick API Reference:</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Base URL:</strong> http://localhost:5000/api</p>
                <p><strong>Authentication:</strong> Include X-API-Key header with your API key</p>
                <p><strong>Main Endpoints:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>POST /auth/register - Create new account</li>
                  <li>POST /auth/login - Login to account</li>
                  <li>GET /auth/profile - Get user profile</li>
                  <li>POST /whatsapp/create-account - Create WhatsApp account</li>
                  <li>GET /whatsapp/qr/:accountToken - Get QR code</li>
                  <li>POST /whatsapp/send - Send WhatsApp message</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
