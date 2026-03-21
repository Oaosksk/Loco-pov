# ngrok Setup Guide

## Quick Setup

### 1. Install ngrok
```bash
# Download from https://ngrok.com/download
# Or use package manager:
choco install ngrok  # Windows
```

### 2. Get Auth Token
1. Sign up at [ngrok.com](https://ngrok.com)
2. Copy your authtoken from dashboard

### 3. Configure ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Start ngrok Tunnel (in new terminal)
```bash
npm run ngrok
```

Or with config file:
```bash
ngrok start loco --config ngrok.yml
```

## Update Supabase Redirect URLs

After starting ngrok, you'll get a URL like: `https://abc123.ngrok.io`

Add to Supabase:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to **Redirect URLs**: `https://YOUR-NGROK-URL.ngrok.io`
3. Add to **Site URL**: `https://YOUR-NGROK-URL.ngrok.io`

## Update Google OAuth

In Google Cloud Console:
1. OAuth 2.0 Client → Authorized redirect URIs
2. Add: `https://amiyleiyzdnmffnxeeiw.supabase.co/auth/v1/callback`
3. Add: `https://YOUR-NGROK-URL.ngrok.io`

## Tips

- ngrok URL changes on restart (free tier)
- Use `ngrok http 5173 --domain=your-static-domain` for paid static domains
- Check tunnel status: `http://localhost:4040`
