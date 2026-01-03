# 🪙 Hemiko Gold Top-Up Website

A premium gold top-up website for Hemiko Discord Bot with Bakong KHQR payment integration.

## ✨ Features

- **🔐 Discord OAuth Login** - Users login with Discord to get their username
- **💰 Gold Packages** - Multiple packages (100 Gold = $1)
- **💳 Bakong KHQR Payment** - Instant payment via Cambodia's national payment system
- **🔍 User Verification** - Checks if Discord user exists in bot's MongoDB
- **📊 Transaction History** - View past purchases
- **🎨 Premium UI** - Dark theme with gold accents and animations

## 📦 Gold Packages

| Package | Gold | Price | Bonus |
|---------|------|-------|-------|
| Starter | 100 | $1 | - |
| Bronze | 500 | $5 | +5% |
| Silver | 1,000 | $10 | +10% |
| Gold | 2,500 | $25 | +15% |
| Diamond | 5,000 | $50 | +20% |
| Ultimate | 10,000 | $100 | +25% |

## 🚀 Setup

### 1. Configure Environment Variables

Add these to your main `.env` file in the Hemiko folder:

```env
# Discord OAuth2 (from https://discord.com/developers/applications)
DISCORD_CLIENT_ID=your_discord_app_client_id
DISCORD_CLIENT_SECRET=your_discord_app_client_secret
DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/callback

# Bakong API (from https://bakong.nbc.gov.kh/)
BAKONG_TOKEN=your_bakong_token
BAKONG_ACCOUNT=yourname@wing
BAKONG_NAME=Hemiko Gold Shop

# Server
TOPUP_PORT=3001
FRONTEND_URL=http://localhost:5173

# Admin (for manual payment confirmation)
ADMIN_KEY=your_secret_key
```

### 2. Discord Developer Portal Setup

1. Go to https://discord.com/developers/applications
2. Create a new application or select existing
3. Go to **OAuth2** → **General**
4. Add Redirect URL: `http://localhost:3001/api/auth/callback`
5. Copy **Client ID** and **Client Secret**

### 3. Install Dependencies

```bash
# Install frontend dependencies
cd website-top-up
npm install

# Install server dependencies
cd server
npm install
```

### 4. Run the Application

**Terminal 1 - API Server:**
```bash
cd website-top-up/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd website-top-up
npm run dev
```

### 5. Access the Website

- Frontend: http://localhost:5173
- API: http://localhost:3001/api

## 📁 Project Structure

```
website-top-up/
├── src/                    # React frontend
│   ├── App.jsx            # Main application
│   ├── App.css            # Additional styles
│   ├── index.css          # Global styles & design system
│   └── main.jsx           # Entry point
├── server/                 # Express API server
│   ├── index.js           # Server entry point
│   ├── routes/
│   │   ├── auth.js        # Discord OAuth routes
│   │   └── payment.js     # Payment & packages routes
│   ├── models/
│   │   ├── Transaction.js # Transaction model
│   │   └── GoldPackage.js # Package model
│   └── config/
│       └── packages.js    # Default packages config
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/login` - Redirect to Discord OAuth
- `GET /api/auth/callback` - OAuth callback handler
- `POST /api/auth/verify` - Verify user in bot database

### Payments
- `GET /api/payment/packages` - Get all gold packages
- `POST /api/payment/create` - Create new payment
- `GET /api/payment/status/:transactionId` - Check payment status
- `GET /api/payment/history/:discordId` - Get user's transaction history
- `POST /api/payment/confirm/:transactionId` - Admin: Confirm payment

## 💳 Payment Flow

1. User logs in with Discord
2. System verifies user exists in bot database
3. User selects a gold package
4. System creates KHQR via Bakong API
5. User scans QR with banking app
6. System detects payment completion
7. Gold is automatically added to user's account

## 🛡️ Security Notes

- OAuth tokens are not stored server-side
- Session data is encoded and passed to frontend
- Admin key required for manual payment confirmation
- Transactions expire after 15 minutes

## 📝 License

MIT License - Part of Hemiko Bot
