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

## Media Endpoints

### GET /api/media/:messageId
Download media file from a WhatsApp message.

**Access:** Public (message ID acts as authorization)

**Note:** Media files are stored for 24 hours after receiving

**Response (200):**
Returns the media file with appropriate Content-Type headers.

**Headers:**
- `Content-Type`: The media MIME type (e.g., `image/jpeg`, `video/mp4`)
- `Content-Disposition`: Suggested filename for download
- `Content-Length`: File size in bytes

**Response (404):**
```json
{
  "success": false,
  "error": "Media not found or expired. Media is only available for 24 hours."
}
```

**Example:**
```bash
curl -O http://103.150.136.76:8090/api/media/3EB0ABC123456789
```

### GET /api/media-stats
Get media service statistics.

**Headers:**
```
X-API-Key: your_api_key
```

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "storedMessages": 42,
    "ttl": "24 hours"
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
    "webhooks": true,
    "mediaDownload": true,
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
    "webhooks": {
      "POST /api/webhooks/register": "Register webhook for incoming messages",
      "GET /api/webhooks/:accountToken": "Get all webhooks for account",
      "PATCH /api/webhooks/:id": "Update webhook",
      "DELETE /api/webhooks/:id": "Delete webhook",
      "POST /api/webhooks/:id/test": "Test webhook"
    },
    "media": {
      "GET /api/media/:messageId": "Download media file from message (24h expiry)",
      "GET /api/media-stats": "Get media service statistics"
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

### Text Message Webhook
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

### Image Message Webhook
```json
{
  "event": "message.received",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "accountToken": "acc_abc123...",
  "message": {
    "id": "3EB0ABC123456789",
    "from": "+1234567890",
    "fromName": "Jane Smith",
    "body": "Check out this product!",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "type": "image",
    "media": {
      "mimetype": "image/jpeg",
      "filename": null,
      "fileSize": 45678,
      "caption": "Check out this product!",
      "url": "http://103.150.136.76:8090/api/media/3EB0ABC123456789"
    }
  }
}
```

### Video Message Webhook
```json
{
  "event": "message.received",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "accountToken": "acc_abc123...",
  "message": {
    "id": "3EB0DEF987654321",
    "from": "+1234567890",
    "fromName": "Mike Johnson",
    "body": "Product demo video",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "type": "video",
    "media": {
      "mimetype": "video/mp4",
      "filename": "demo.mp4",
      "fileSize": 1234567,
      "caption": "Product demo video",
      "url": "http://103.150.136.76:8090/api/media/3EB0DEF987654321"
    }
  }
}
```

### Document Message Webhook
```json
{
  "event": "message.received",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "accountToken": "acc_abc123...",
  "message": {
    "id": "3EB0JKL789456123",
    "from": "+1234567890",
    "fromName": "Sarah Williams",
    "body": "Please review this contract",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "type": "document",
    "media": {
      "mimetype": "application/pdf",
      "filename": "contract.pdf",
      "fileSize": 567890,
      "caption": "Please review this contract",
      "url": "http://103.150.136.76:8090/api/media/3EB0JKL789456123"
    }
  }
}
```

### Audio Message Webhook
```json
{
  "event": "message.received",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "accountToken": "acc_abc123...",
  "message": {
    "id": "3EB0GHI456789123",
    "from": "+1234567890",
    "fromName": "Tom Brown",
    "body": "[Media message]",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "type": "audio",
    "media": {
      "mimetype": "audio/ogg; codecs=opus",
      "filename": null,
      "fileSize": 23456,
      "caption": null,
      "url": "http://103.150.136.76:8090/api/media/3EB0GHI456789123"
    }
  }
}
```

**Notes:**
- Media files are available for **24 hours** after receiving
- Use the `media.url` to download the actual file
- The `message.body` contains the caption for media with captions, or "[Media message]" otherwise
- Download media immediately if you need to keep it longer than 24 hours

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

### Webhook Handler with Media Support (Node.js/Express)
```javascript
const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const { event, message, accountToken } = req.body;

  // Respond quickly
  res.status(200).json({ success: true });

  // Process webhook asynchronously
  try {
    console.log(`Received ${event} from ${message.fromName}: ${message.body}`);

    // Handle media messages
    if (message.media) {
      console.log(`Media type: ${message.type}`);
      console.log(`Filename: ${message.media.filename || 'N/A'}`);
      console.log(`Size: ${message.media.fileSize} bytes`);

      // Download the media file
      const response = await axios.get(message.media.url, {
        responseType: 'arraybuffer'
      });

      // Save to disk
      const filename = message.media.filename || `${message.id}.${message.type}`;
      fs.writeFileSync(`./downloads/${filename}`, response.data);
      console.log(`Media saved to: ./downloads/${filename}`);

      // Process based on media type
      if (message.type === 'image') {
        console.log('Processing image...');
        // Your image processing logic here
      } else if (message.type === 'document') {
        console.log('Processing document...');
        // Your document processing logic here
      }
    } else {
      // Handle text message
      console.log('Text message:', message.body);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Webhook Handler with Media Support (Python/Flask)
```python
from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

def download_media(media_url, message_id, filename=None):
    """Download media file from webhook URL"""
    response = requests.get(media_url)
    if response.status_code == 200:
        if not filename:
            filename = f"{message_id}.jpg"

        filepath = f'./downloads/{filename}'
        with open(filepath, 'wb') as f:
            f.write(response.content)
        return filepath
    return None

@app.route('/webhook', methods=['POST'])
def webhook():
    payload = request.json
    message = payload['message']

    # Respond quickly
    response = jsonify({'success': True})

    # Process webhook
    print(f"Received message from {message['fromName']}: {message['body']}")

    # Handle media
    if 'media' in message:
        media = message['media']
        print(f"Media type: {message['type']}")
        print(f"Filename: {media.get('filename', 'N/A')}")
        print(f"Size: {media.get('fileSize')} bytes")

        # Download media
        filepath = download_media(
            media['url'],
            message['id'],
            media.get('filename')
        )

        if filepath:
            print(f"Media saved to: {filepath}")

            # Process media based on type
            if message['type'] == 'image':
                print('Processing image...')
                # Your image processing logic here
            elif message['type'] == 'document':
                print('Processing document...')
                # Your document processing logic here
    else:
        # Handle text message
        print(f"Text message: {message['body']}")

    return response

if __name__ == '__main__':
    # Create downloads directory if it doesn't exist
    os.makedirs('./downloads', exist_ok=True)
    app.run(port=3000)
```

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/whatsapp"

# Server
PORT=5000
NODE_ENV=production
API_BASE_URL=http://103.150.136.76:8090

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
6. **"Media not found or expired"**: Media files expire after 24 hours - download immediately
7. **"Cannot download media"**: Check that the message ID is correct and media hasn't expired

### Debugging Tips

1. Check the `/api/health` endpoint to verify server status
2. Use the `/api/account/:token/status` endpoint to check WhatsApp connection
3. Monitor rate limiting headers in API responses
4. Check webhook delivery logs for debugging integration issues

---

## Additional Documentation

For detailed information about specific features, see:

- **[Media Webhooks Documentation](./MEDIA_WEBHOOKS.md)** - Complete guide for handling media messages in webhooks
- **[Webhooks Documentation](./WEBHOOKS.md)** - Comprehensive webhook implementation guide with examples

---

## Support

For support and questions:
- Check the API documentation
- Review error messages for specific issues
- Test endpoints individually before integration
- Monitor logs for detailed error information
- See additional documentation links above for detailed guides

**Version**: 2.1.0 (Media Support Added)
**Last Updated**: 2025-01-20