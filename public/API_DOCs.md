# WhatsApp API Documentation

## Overview
The WhatsApp API provides a complete solution for sending messages, managing accounts, and handling webhooks. It includes user authentication, WhatsApp account management, and real-time messaging capabilities.

**Base URL:** `http:103.150.136.76:8090` (or `http://localhost:5000` for development)

## Authentication

The API uses a two-part authentication system:
- **API Key** - For user authentication (X-API-Key header)
- **Account Token** - For WhatsApp account authorization (Authorization: Bearer token)

### Required Headers
```
X-API-Key: your_user_api_key
Authorization: Bearer your_whatsapp_account_token
```

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "mobile": "+1234567890",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "mobile": "+1234567890",
    "role": "user",
    "apiKey": "api_abc123...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "nextSteps": {
    "step1": "Use your API key to start WhatsApp account creation",
    "step2": "POST /api/auth/start-qr-with-user with your API key",
    "step3": "Scan QR code to connect WhatsApp"
  }
}
```

### POST /api/auth/login
Authenticate a user and get API key.

**Request Body:**
```json
{
  "mobile": "+1234567890",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "mobile": "+1234567890",
    "apiKey": "api_abc123...",
    "role": "user",
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "nextSteps": {
    "step1": "Use your API key to start WhatsApp account creation",
    "step2": "POST /api/auth/start-qr-with-user with your API key",
    "step3": "Scan QR code to connect WhatsApp"
  }
}
```

### GET /api/auth/profile
Get user profile by API key (for frontend use).

**Headers:**
```
X-API-Key: your_api_key
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "mobile": "+1234567890",
    "apiKey": "api_abc123...",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "isActive": true
  },
  "statistics": {
    "totalAccounts": 3,
    "connectedAccounts": 2,
    "disconnectedAccounts": 1
  }
}
```

## WhatsApp Account Management

### POST /api/auth/start-qr-with-user
Start QR-based WhatsApp account creation for registered user.

**Request Body:**
```json
{
  "apiKey": "api_abc123..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "WhatsApp account creation started",
  "account": {
    "accountToken": "acc_abc123...",
    "userId": 1,
    "apiKey": "api_abc123...",
    "isConnected": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "instructions": {
    "step1": "Scan QR code to connect your WhatsApp",
    "step2": "After successful scan, your WhatsApp account will be ready",
    "step3": "Use the account token + API key to send messages"
  },
  "qrCodeUrl": "/api/auth/qr-user/acc_abc123...",
  "tokenCheckUrl": "/api/auth/user-token-status/acc_abc123..."
}
```

### GET /api/auth/qr-user/:accountToken
Display QR code for user WhatsApp account creation (returns HTML page).

### GET /api/auth/user-token-status/:accountToken
Check WhatsApp connection status for user account.

**Response (200):**
```json
{
  "success": true,
  "message": "WhatsApp account connected successfully!",
  "status": "ready",
  "account": {
    "accountToken": "acc_abc123...",
    "phoneNumber": "+1234567890",
    "whatsappName": "John's WhatsApp",
    "isConnected": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "user": {
    "mobile": "+1234567890",
    "apiKey": "api_abc123..."
  },
  "usage": {
    "sendMessages": "POST /api/send-message",
    "templates": "GET /api/templates",
    "checkStatus": "GET /api/account/acc_abc123.../status"
  },
  "exampleMessage": {
    "url": "POST /api/send-message",
    "headers": {
      "Content-Type": "application/json",
      "X-API-Key": "api_abc123...",
      "Authorization": "Bearer acc_abc123..."
    },
    "body": {
      "to": "+1234567890",
      "message": "Hello from my WhatsApp API!"
    }
  }
}
```

### GET /api/whatsapp/accounts/:userId
Get user's WhatsApp accounts.

**Headers:**
```
X-API-Key: your_api_key
```

**Response (200):**
```json
{
  "success": true,
  "accounts": [
    {
      "id": 1,
      "userId": 1,
      "accountToken": "acc_abc123...",
      "phoneNumber": "+1234567890",
      "whatsappName": "John's WhatsApp",
      "isConnected": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/whatsapp/connected/:userId
Get user's connected WhatsApp accounts.

**Headers:**
```
X-API-Key: your_api_key
```

**Response (200):**
```json
{
  "success": true,
  "accounts": [
    {
      "id": 1,
      "userId": 1,
      "accountToken": "acc_abc123...",
      "phoneNumber": "+1234567890",
      "whatsappName": "John's WhatsApp",
      "isConnected": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/whatsapp/create-account
Create new WhatsApp account for user.

**Headers:**
```
X-API-Key: your_api_key
```

**Request Body:**
```json
{
  "userId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "WhatsApp account created successfully",
  "account": {
    "id": 2,
    "userId": 1,
    "accountToken": "acc_def456...",
    "phoneNumber": null,
    "whatsappName": null,
    "isConnected": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/whatsapp/qr/:accountToken
Get QR code for WhatsApp account.

**Headers:**
```
X-API-Key: your_api_key
```

**Response (200):**
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "accountToken": "acc_abc123...",
  "isConnected": false,
  "message": "QR code ready"
}
```

### GET /api/whatsapp/status/:accountToken
Check WhatsApp connection status.

**Headers:**
```
X-API-Key: your_api_key
```

**Response (200):**
```json
{
  "success": true,
  "isConnected": true,
  "phoneNumber": "+1234567890",
  "whatsappName": "John's WhatsApp",
  "accountToken": "acc_abc123..."
}
```

## Messaging Endpoints

### POST /api/send-message
Send a WhatsApp text message.

**Headers:**
```
X-API-Key: your_api_key
Authorization: Bearer acc_abc123...
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Hello from WhatsApp API!"
}
```

**Or using templates:**
```json
{
  "to": "+1234567890",
  "template": "welcome",
  "templateData": {
    "name": "John"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "messageId": "ABC123_DEF456",
  "status": "sent"
}
```

### POST /api/send-media
Send a WhatsApp media message (image, video, audio, document).

**Headers:**
```
X-API-Key: your_api_key
Authorization: Bearer acc_abc123...
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
to: "+1234567890"
file: <media file>
caption: "Optional caption for image/video/document"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Media sent successfully",
  "messageId": "ABC123_DEF456",
  "status": "sent",
  "mediaType": "image"
}
```

## Template Management

### GET /api/templates
Get all available message templates.

**Headers:**
```
X-API-Key: your_api_key
Authorization: Bearer acc_abc123...
```

**Response (200):**
```json
{
  "success": true,
  "templates": [
    {
      "name": "welcome",
      "content": "Hello {{name}}! Welcome to our service. Thank you for joining!"
    },
    {
      "name": "appointment",
      "content": "Hi {{name}}, this is a reminder about your appointment on {{date}} at {{time}}."
    }
  ]
}
```

### POST /api/templates
Add a new message template.

**Headers:**
```
X-API-Key: your_api_key
Authorization: Bearer acc_abc123...
```

**Request Body:**
```json
{
  "name": "greeting",
  "template": "Hello {{name}}, how are you today?"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Template created successfully",
  "template": {
    "name": "greeting",
    "content": "Hello {{name}}, how are you today?"
  }
}
```

### DELETE /api/templates/:name
Delete a message template.

**Headers:**
```
X-API-Key: your_api_key
Authorization: Bearer acc_abc123...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

## Webhook Management

### POST /api/webhooks/register
Register a new webhook for incoming messages.

**Headers:**
```
X-API-Key: your_api_key
```

**Request Body:**
```json
{
  "accountToken": "acc_abc123...",
  "url": "https://your-server.com/webhook",
  "secret": "optional_secret_for_signature",
  "events": ["message.received"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Webhook registered successfully",
  "webhook": {
    "id": 1,
    "url": "https://your-server.com/webhook",
    "events": ["message.received"],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/webhooks/:accountToken
Get all webhooks for an account.

**Headers:**
```
X-API-Key: your_api_key
```

**Response (200):**
```json
{
  "success": true,
  "webhooks": [
    {
      "id": 1,
      "url": "https://your-server.com/webhook",
      "events": ["message.received"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PATCH /api/webhooks/:id
Update webhook (toggle active, change URL, etc.).

**Headers:**
```
X-API-Key: your_api_key
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook updated successfully",
  "webhook": {
    "id": 1,
    "url": "https://your-server.com/webhook",
    "events": ["message.received"],
    "isActive": false,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### DELETE /api/webhooks/:id
Delete a webhook.

**Headers:**
```
X-API-Key: your_api_key
```

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

### POST /api/webhooks/:id/test
Send a test payload to webhook.

**Headers:**
```
X-API-Key: your_api_key
```

**Response (200):**
```json
{
  "success": true,
  "message": "Test webhook sent successfully",
  "testResult": {
    "status": "success",
    "responseTime": "120ms"
  }
}
```

## Utility Endpoints

### GET /api/health
Health check endpoint.

**Response (200):**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "2.0.0",
  "features": {
    "userRegistration": true,
    "whatsappIntegration": true,
    "messageTemplates": true,
    "mediaMessages": true,
    "rateLimiting": true,
    "databaseStorage": true
  }
}
```

### GET /api/docs
API documentation endpoint.

**Response (200):**
```json
{
  "title": "WhatsApp API Documentation",
  "version": "2.0.0",
  "description": "WhatsApp Business API with user registration and multi-account support",
  "endpoints": {
    "authentication": {
      "POST /api/auth/register": "Register new user",
      "POST /api/auth/login": "User login",
      "POST /api/auth/start-qr-with-user": "Start WhatsApp connection",
      "GET /api/auth/qr-user/:accountToken": "Display QR code",
      "GET /api/auth/user-token-status/:accountToken": "Check connection status",
      "GET /api/auth/user/:userId/profile": "Get user profile",
      "GET /api/auth/profile": "Get user profile by API key (frontend)",
      "GET /api/auth/user/:userId/whatsapp-accounts": "Get user WhatsApp accounts"
    },
    "messaging": {
      "POST /api/send-message": "Send WhatsApp text message",
      "POST /api/send-media": "Send WhatsApp media message",
      "GET /api/templates": "List message templates",
      "POST /api/templates": "Create message template",
      "DELETE /api/templates/:name": "Delete message template",
      "GET /api/account/:token/status": "Check account status",
      "GET /api/account/:token/messages": "Get message history"
    },
    "utilities": {
      "GET /api/health": "Health check",
      "GET /api/docs": "API documentation"
    }
  }
}
```

### GET /api/account/:token/status
Check WhatsApp connection status for an account.

**Headers:**
```
X-API-Key: your_api_key
Authorization: Bearer acc_abc123...
```

**Response (200):**
```json
{
  "success": true,
  "account": {
    "accountToken": "acc_abc123...",
    "phoneNumber": "+1234567890",
    "whatsappName": "John's WhatsApp",
    "isConnected": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "statistics": {
    "messagesSent": 150,
    "messagesReceived": 45,
    "lastActivity": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/account/:token/messages
Get message history for an account.

**Headers:**
```
X-API-Key: your_api_key
Authorization: Bearer acc_abc123...
```

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Response (200):**
```json
{
  "success": true,
  "messages": [
    {
      "id": "MSG123",
      "from": "+1234567890",
      "to": "+0987654321",
      "content": "Hello World!",
      "type": "text",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "direction": "outbound",
      "status": "delivered"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

## Error Handling

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Request validation failed"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid API Key or Account Token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied: You can only access your own data"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found",
  "path": "/api/endpoint"
}
```

### 429 Rate Limit Exceeded
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "resetTime": "2024-01-01T00:01:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

- **Window**: 60 seconds
- **Max Messages**: 30 messages per window per account
- **Headers**: Rate limit info included in responses

## Webhook Payloads

When webhooks are triggered, the payload structure is:

### Message Received Webhook
```json
{
  "event": "message.received",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "accountToken": "acc_abc123...",
  "message": {
    "id": "MSG123",
    "from": "+1234567890",
    "fromName": "John Doe",
    "body": "Hello World!",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "type": "text"
  }
}
```

## SDKs and Libraries

### JavaScript/Node.js Example
```javascript
const API_BASE_URL = 'https://your-domain.com';
const API_KEY = 'your_api_key';
const ACCOUNT_TOKEN = 'your_account_token';

// Send a message
async function sendMessage(to, message) {
  const response = await fetch(`${API_BASE_URL}/api/send-message`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${ACCOUNT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, message }),
  });

  return response.json();
}

// Send media
async function sendMedia(to, file, caption) {
  const formData = new FormData();
  formData.append('to', to);
  formData.append('file', file);
  formData.append('caption', caption);

  const response = await fetch(`${API_BASE_URL}/api/send-media`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${ACCOUNT_TOKEN}`,
    },
    body: formData,
  });

  return response.json();
}
```

### Python Example
```python
import requests

API_BASE_URL = 'https://your-domain.com'
API_KEY = 'your_api_key'
ACCOUNT_TOKEN = 'your_account_token'

def send_message(to, message):
    url = f"{API_BASE_URL}/api/send-message"
    headers = {
        'X-API-Key': API_KEY,
        'Authorization': f'Bearer {ACCOUNT_TOKEN}',
        'Content-Type': 'application/json',
    }
    data = {'to': to, 'message': message}

    response = requests.post(url, headers=headers, json=data)
    return response.json()

def send_media(to, file_path, caption):
    url = f"{API_BASE_URL}/api/send-media"
    headers = {
        'X-API-Key': API_KEY,
        'Authorization': f'Bearer {ACCOUNT_TOKEN}',
    }

    with open(file_path, 'rb') as file:
        files = {'file': file}
        data = {'to': to, 'caption': caption}
        response = requests.post(url, headers=headers, files=files, data=data)

    return response.json()
```

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/whatsapp"

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-frontend.com,https://www.your-frontend.com

# API
API_KEY=your_server_api_key
SESSION_DIR=./sessions

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
MAX_MESSAGES_PER_WINDOW=30
```

### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## Security Considerations

1. **API Keys**: Keep your API keys secure and never expose them in client-side code
2. **Account Tokens**: Treat account tokens like passwords - they grant access to WhatsApp accounts
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement client-side rate limiting to respect server limits
5. **Input Validation**: Validate phone numbers and message content before sending
6. **Webhook Security**: Validate webhook signatures and verify source IP addresses

## Troubleshooting

### Common Issues

1. **"Account not connected"**: Make sure to complete the QR scanning process first
2. **"Invalid API Key"**: Check that the API key is correct and active
3. **"Rate limit exceeded"**: Wait for the rate limit window to reset
4. **"Message sending failed"**: Check phone number format and WhatsApp account status
5. **"Webhook not working"**: Verify webhook URL is accessible and supports POST requests

### Debugging Tips

1. Check the `/api/health` endpoint to verify server status
2. Use the `/api/account/:token/status` endpoint to check WhatsApp connection
3. Monitor rate limiting headers in API responses
4. Check webhook delivery logs for debugging integration issues

---

## Support

For support and questions:
- Check the API documentation
- Review error messages for specific issues
- Test endpoints individually before integration
- Monitor logs for detailed error information

**Version**: 2.0.0
**Last Updated**: 2024-01-01