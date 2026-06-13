# Vercel Deployment Guide — Trend Verse Bharat

Yeh project TanStack Start pe bana hai aur Vercel pe deploy ho sakta hai.

## 1. Push code to GitHub
Lovable se GitHub connect karke repo push karo.

## 2. Vercel pe Import
- vercel.com → New Project → Import your repo
- Framework Preset: **Other** (vercel.json already configured)
- Build Command: `bun run build` (auto)
- Output Directory: `.vercel/output` (auto)

## 3. Environment Variables (CRITICAL)
Vercel Project Settings → Environment Variables me yeh sab add karo
(values Lovable Cloud ke same Supabase project se lo):

### Client (Vite — browser pe expose hote hain)
- `VITE_SUPABASE_URL` = `https://rrqwpjrowqeatmawjzng.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = (anon/publishable key — same as .env)
- `VITE_SUPABASE_PROJECT_ID` = `rrqwpjrowqeatmawjzng`

### Server (SSR + server functions)
- `SUPABASE_URL` = `https://rrqwpjrowqeatmawjzng.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` = (same anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = (service role — **secret**, sirf Vercel pe daalo)
- `LOVABLE_API_KEY` = (agar AI features use kar rahe ho)

> Service role key Lovable Cloud dashboard se nahi milti — agar AI/admin
> server functions chahiye to Supabase project owner se key lo.

## 4. Deploy
Deploy click karo. Build ke baad live URL milega.

## 5. Supabase Auth Redirect URLs
Supabase → Authentication → URL Configuration me apna Vercel domain add karo:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

Bas — admin `/auth` pe login karo aur `/admin` se content manage karo.
