'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Image, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard as copyText } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface CodeBlockProps {
  code: string;
  language: string;
  id: string;
  copiedText: string | null;
  onCopy: (text: string, id: string) => void;
}

const CodeBlock = ({ code, language, id, copiedText, onCopy }: CodeBlockProps) => (
  <div className="relative">
    <div className="absolute right-2 top-2">
      <button
        onClick={() => onCopy(code, id)}
        className="p-2 rounded-md hover:bg-gray-700 transition-colors"
      >
        {copiedText === id ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  </div>
);

export default function DocsPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await copyText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Still show success briefly to indicate the attempt was made
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 1000);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">API Documentation</h1>
      </div>

      <div className="space-y-6">
        {/* Authentication Info */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>All messaging endpoints require authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Required Headers:</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">X-API-Key:</span>
                  <span className="text-blue-600">your_api_key</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Authorization:</span>
                  <span className="text-blue-600">Bearer your_account_token</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Your API key is available in your profile. Account tokens are generated when you connect a WhatsApp account.
            </p>
          </CardContent>
        </Card>

        {/* Send Message Endpoint */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Send Text Message</CardTitle>
                <CardDescription>Send a WhatsApp text message</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Endpoint */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-600">POST</Badge>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">/api/send-message</code>
              </div>
            </div>

            {/* Request */}
            <div>
              <h4 className="font-semibold mb-3">Request Body</h4>
              <Tabs defaultValue="example" className="w-full">
                <TabsList>
                  <TabsTrigger value="example">Example</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                </TabsList>
                <TabsContent value="example" className="mt-3">
                  <CodeBlock
                    id="send-message-example"
                    language="json"
                    copiedText={copiedText}
                    onCopy={copyToClipboard}
                    code={`{
  "to": "919876543210",
  "message": "Hello from WhatsApp API!"
}`}
                  />
                </TabsContent>
                <TabsContent value="schema" className="mt-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Field</th>
                          <th className="text-left py-2">Type</th>
                          <th className="text-left py-2">Required</th>
                          <th className="text-left py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 font-mono">to</td>
                          <td className="py-2">string</td>
                          <td className="py-2">Yes</td>
                          <td className="py-2">Recipient phone number (country code + number)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-mono">message</td>
                          <td className="py-2">string</td>
                          <td className="py-2">Yes*</td>
                          <td className="py-2">Message text (required if template not used)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-mono">template</td>
                          <td className="py-2">string</td>
                          <td className="py-2">No</td>
                          <td className="py-2">Template name (optional)</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono">templateData</td>
                          <td className="py-2">object</td>
                          <td className="py-2">No</td>
                          <td className="py-2">Template variables (required if using template)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Code Examples */}
            <div>
              <h4 className="font-semibold mb-3">Code Examples</h4>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-3">
                  <CodeBlock
                    id="send-message-curl"
                    language="bash"
                    copiedText={copiedText}
                    onCopy={copyToClipboard}
                    code={`curl -X POST ${API_BASE_URL}/api/send-message \\
  -H "X-API-Key: your_api_key" \\
  -H "Authorization: Bearer your_account_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "919876543210",
    "message": "Hello from WhatsApp API!"
  }'`}
                  />
                </TabsContent>
                <TabsContent value="javascript" className="mt-3">
                  <CodeBlock
                    id="send-message-js"
                    language="javascript"
                    copiedText={copiedText}
                    onCopy={copyToClipboard}
                    code={`const response = await fetch('${API_BASE_URL}/api/send-message', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key',
    'Authorization': 'Bearer your_account_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '919876543210',
    message: 'Hello from WhatsApp API!'
  })
});

const result = await response.json();
console.log(result);`}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Response */}
            <div>
              <h4 className="font-semibold mb-3">Success Response</h4>
              <CodeBlock
                id="send-message-response"
                language="json"
                copiedText={copiedText}
                onCopy={copyToClipboard}
                code={`{
  "success": true,
  "messageId": "3EB0ABC123456789",
  "to": "919876543210",
  "account": {
    "token": "whatsapp_abc123",
    "user": {
      "mobile": "919123456789",
      "name": "John Doe"
    }
  },
  "messageType": "direct",
  "rateLimitRemaining": 99,
  "timestamp": "2025-01-15T10:30:00.000Z"
}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Send Media Endpoint */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Send Media Message</CardTitle>
                <CardDescription>Send images, videos, audio, or documents via WhatsApp</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Endpoint */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-600">POST</Badge>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">/api/send-media</code>
              </div>
            </div>

            {/* Supported Media Types */}
            <div>
              <h4 className="font-semibold mb-3">Supported Media Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-semibold text-blue-900 text-sm mb-1">Images</h5>
                  <p className="text-xs text-blue-700">JPEG, PNG, GIF, WebP</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h5 className="font-semibold text-purple-900 text-sm mb-1">Videos</h5>
                  <p className="text-xs text-purple-700">MP4, MPEG, MOV, AVI</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h5 className="font-semibold text-green-900 text-sm mb-1">Audio</h5>
                  <p className="text-xs text-green-700">MP3, WAV, OGG, AAC</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h5 className="font-semibold text-orange-900 text-sm mb-1">Documents</h5>
                  <p className="text-xs text-orange-700">PDF, DOC, XLS, TXT</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Maximum file size: <strong>100 MB</strong>
              </p>
            </div>

            {/* Request */}
            <div>
              <h4 className="font-semibold mb-3">Request Body (multipart/form-data)</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Field</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Required</th>
                      <th className="text-left py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-mono">to</td>
                      <td className="py-2">string</td>
                      <td className="py-2">Yes</td>
                      <td className="py-2">Recipient phone number</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono">file</td>
                      <td className="py-2">file</td>
                      <td className="py-2">Yes</td>
                      <td className="py-2">Media file to send</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono">caption</td>
                      <td className="py-2">string</td>
                      <td className="py-2">No</td>
                      <td className="py-2">Optional caption (for images, videos, documents)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Examples */}
            <div>
              <h4 className="font-semibold mb-3">Code Examples</h4>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-3">
                  <CodeBlock
                    id="send-media-curl"
                    language="bash"
                    copiedText={copiedText}
                    onCopy={copyToClipboard}
                    code={`curl -X POST ${API_BASE_URL}/api/send-media \\
  -H "X-API-Key: your_api_key" \\
  -H "Authorization: Bearer your_account_token" \\
  -F "to=919876543210" \\
  -F "file=@/path/to/image.jpg" \\
  -F "caption=Check out this image!"`}
                  />
                </TabsContent>
                <TabsContent value="javascript" className="mt-3">
                  <CodeBlock
                    id="send-media-js"
                    language="javascript"
                    copiedText={copiedText}
                    onCopy={copyToClipboard}
                    code={`// Get file from input element
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// Create FormData
const formData = new FormData();
formData.append('to', '919876543210');
formData.append('file', file);
formData.append('caption', 'Check out this image!');

// Send request
const response = await fetch('${API_BASE_URL}/api/send-media', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key',
    'Authorization': 'Bearer your_account_token'
  },
  body: formData
});

const result = await response.json();
console.log(result);`}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Response */}
            <div>
              <h4 className="font-semibold mb-3">Success Response</h4>
              <CodeBlock
                id="send-media-response"
                language="json"
                copiedText={copiedText}
                onCopy={copyToClipboard}
                code={`{
  "success": true,
  "messageId": "3EB0ABC123456789",
  "to": "919876543210",
  "mediaType": "image",
  "fileName": "photo.jpg",
  "fileSize": 245678,
  "mimeType": "image/jpeg",
  "account": {
    "token": "whatsapp_abc123",
    "user": {
      "mobile": "919123456789",
      "name": "John Doe"
    }
  },
  "rateLimitRemaining": 99,
  "timestamp": "2025-01-15T10:30:00.000Z"
}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Responses */}
        <Card>
          <CardHeader>
            <CardTitle>Error Responses</CardTitle>
            <CardDescription>Common error responses you may encounter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm">401 Unauthorized</h4>
                <CodeBlock
                  id="error-401"
                  language="json"
                  copiedText={copiedText}
                  onCopy={copyToClipboard}
                  code={`{
  "success": false,
  "error": "Unauthorized: Invalid API Key"
}`}
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm">400 Bad Request</h4>
                <CodeBlock
                  id="error-400"
                  language="json"
                  copiedText={copiedText}
                  onCopy={copyToClipboard}
                  code={`{
  "success": false,
  "error": "Invalid phone number format. Use: countrycode+number (e.g., 919876543210)"
}`}
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm">503 Service Unavailable</h4>
                <CodeBlock
                  id="error-503"
                  language="json"
                  copiedText={copiedText}
                  onCopy={copyToClipboard}
                  code={`{
  "success": false,
  "error": "WhatsApp client not available. Please try reconnecting.",
  "help": "Start a new QR session: POST /api/auth/start-qr-with-user"
}`}
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm">429 Too Many Requests</h4>
                <CodeBlock
                  id="error-429"
                  language="json"
                  copiedText={copiedText}
                  onCopy={copyToClipboard}
                  code={`{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "resetTime": "2025-01-15T11:00:00.000Z"
}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Always include country code with phone numbers (e.g., 91 for India)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Keep messages under 4096 characters for best compatibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Compress large media files before sending to reduce upload time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Handle rate limits gracefully with exponential backoff</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Store message IDs for tracking and debugging purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Validate file types on the client side before uploading media</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
