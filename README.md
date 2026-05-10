# ⚡ LeadMachine — Next.js 14 App Router + Tailwind CSS

> Instagram DM Automation SaaS · Razorpay · Firebase · Admin Panel · India 🇮🇳

## 📁 Structure
```
app/
├── page.tsx                 Landing page
├── layout.tsx               Root layout + AuthProvider
├── (auth)/login/page.tsx    Login (Email + Google)
├── (auth)/signup/page.tsx   Signup → 7-day trial auto-starts
├── dashboard/page.tsx       User dashboard (protected)
├── pricing/page.tsx         Plans + Razorpay checkout
├── about, contact, terms, privacy
├── admin/page.tsx           Admin login
├── admin/dashboard/page.tsx Full admin panel
└── api/payment/             create-order + verify routes

components/ → Navbar, Footer
context/    → AuthContext (useAuth hook)
lib/        → firebase.ts (client SDK + all helpers)
```

## 🚀 Quick Start
```bash
npm install
cp .env.local.example .env.local   # fill in values
npm run dev                         # localhost:3000
```

## 🔑 Setup Steps

### 1. Firebase
- console.firebase.google.com → New Project
- Authentication → Enable Email/Password + Google
- Firestore → Create database → Production → asia-south1
- Web App config → paste in .env.local as NEXT_PUBLIC_FIREBASE_*
- Service Account key → paste in .env.local as FIREBASE_*

### 2. Razorpay
- dashboard.razorpay.com → API Keys → Generate
- Key ID → NEXT_PUBLIC_RAZORPAY_KEY_ID + RAZORPAY_KEY_ID
- Key Secret → RAZORPAY_KEY_SECRET

### 3. Deploy → Vercel
```bash
npm i -g vercel && vercel --prod
# Add all env vars in Vercel dashboard
```

### 4. Make Yourself Admin
```
Firebase Console → Firestore → users → your-uid
→ Add field: is_admin = true
Then login at /admin
```

## 💳 Subscription Model
| Plan | Price | Duration |
|------|-------|----------|
| Free Trial | ₹0 | 7 days |
| Pro | ₹499/month | 30 days |

## 👑 Admin Panel
Users · Revenue · All Leads · Bot Toggle · Grant Pro · Suspend
