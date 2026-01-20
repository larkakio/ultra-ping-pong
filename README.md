# Ultra Ping Pong - Cyberpunk Pong Mini App

Futuristic neon Pong game with cyberpunk aesthetics for Base App and Farcaster.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your domain URL

4. Run development server:
```bash
npm run dev
```

## 📋 Setup Checklist

### 1. Base App ID Setup
- Go to https://base.dev
- Create a new mini-app
- Copy the `base:app_id` 
- Replace `[ВАШ_APP_ID_З_BASE_DEV]` in `app/layout.tsx`

### 2. Farcaster Manifest Setup
- Deploy your app first **WITHOUT** `accountAssociation` in `farcaster.json`
- Go to: https://farcaster.xyz/~/developers/mini-apps/manifest?domain=[ВАШ_ДОМЕН]
- Click "Generate account association"
- Sign through Farcaster
- Copy the generated `accountAssociation` object
- Add it to `public/.well-known/farcaster.json` and redeploy

### 3. Update Domain URLs
- Replace all `[ВАШ_ДОМЕН]` in `public/.well-known/farcaster.json` with your actual domain
- Replace `[ВАШ_ДОМЕН_БЕЗ_HTTPS]` with domain without protocol (e.g., `ultra-ping-pong.vercel.app`)

### 4. Create Assets
- Create `/public/icon.png` (512x512 PNG, cyberpunk style)
- Create `/public/hero-image.svg` (1200x630, neon Pong visual)

## ⚠️ Critical Notes

1. **`requiredChains`** must be `["eip155:8453"]` NOT `[8453]`
2. All URLs in `farcaster.json` must be absolute (with https://)
3. Use `sdk.actions.openUrl()` instead of `window.open()`
4. Call `sdk.actions.ready()` when SDK loads
5. `description` must be detailed for search discovery

## 🎮 Game Features

- Single player vs AI
- Cyberpunk neon aesthetics
- Touch and keyboard controls
- Sound effects (toggleable)
- Farcaster sharing
- Responsive design
- 60 FPS performance

## 🛠️ Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Farcaster Frame SDK v2
- Web Audio API

## 📱 Controls

- **Keyboard**: Arrow Keys or W/S to move paddle, SPACE to pause
- **Touch/Mouse**: Tap/drag to move paddle

## 🎯 Scoring

First to 11 points wins!

## 📦 Build

```bash
npm run build
npm start
```

## 🚢 Deploy

Deploy to Vercel, Netlify, or any platform supporting Next.js.

Remember to:
1. Set environment variables
2. Update all domain references
3. Add Base App ID
4. Generate Farcaster account association
5. Create icon and hero image assets