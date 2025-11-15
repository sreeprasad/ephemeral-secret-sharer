# 🔐 Ephemeral Secret Sharer

A secure, one-time secret sharing application built with Next.js and end-to-end encryption. Share sensitive information through self-destructing links that can only be viewed once.

![Ephemeral Secret Sharer](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔒 **End-to-End Encryption** - AES-256-GCM encryption happens in the browser
- 🔥 **Self-Destructing Links** - Secrets are destroyed after first view
- ⏱️ **Auto-Expiration** - All secrets expire after 5 minutes
- 🔑 **Zero-Knowledge Architecture** - Encryption keys never touch the server
- 🚀 **Serverless** - Powered by Vercel and Upstash Redis


## 🎯 Use Cases

Perfect for sharing:
- 🔐 Passwords or API keys
- 📝 Confidential messages
- 🔑 Private tokens
- 📄 Sensitive text



## 🔒 Security Architecture

### How It Works

1. **Client-Side Encryption**
    - User enters a secret
    - A random 256-bit AES-GCM key is generated in the browser
    - Secret is encrypted with the key
    - Only encrypted data is sent to the server

2. **Secure Storage**
    - Encrypted data stored in Redis with 5-minute TTL
    - Unique ID generated for each secret
    - No plaintext ever touches the server

3. **Key Management**
    - Encryption key is appended to URL as fragment (`#key`)
    - Fragment is never sent to server (browser-only)
    - Key is used client-side to decrypt the secret

4. **One-Time Access**
    - Secret is deleted from Redis immediately after retrieval
    - Link becomes invalid after first view
    - Even with the key, secret cannot be recovered

### Encryption Details

- **Algorithm**: AES-256-GCM
- **Key Size**: 256 bits
- **IV Size**: 96 bits (12 bytes)
- **Authentication**: Built-in with GCM mode
- **Implementation**: Web Crypto API (native browser encryption)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local Redis)
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
```bash
   git clone https://github.com/sreeprasad/ephemeral-secret-sharer.git
   cd ephemeral-secret-sharer
```

2. **Install dependencies**
```bash
   npm install
```

3. **Start local Redis**
```bash
   docker run -d --name ephemeral-redis -p 6379:6379 redis:latest
```

4. **Create environment file**
```bash
   cp .env.local.example .env.local
```

Add to `.env.local`:
```env
   REDIS_URL=redis://localhost:6379
```

5. **Run development server**
```bash
   npm run dev
```

6. **Open browser**
```
   http://localhost:3000
```

**Disclaimer**: This application is provided as-is for educational and personal use. While it implements strong encryption, always assess your own security requirements before sharing highly sensitive information.
