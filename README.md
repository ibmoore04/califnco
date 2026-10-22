# Califnco — E-Commerce Water Purifier Platform & AI Automation

This repository contains the full-stack technical assignment solution for the **Califnco Software Developer** role.

## 🏗 Repository Architecture

```text
califnco-assignment/
├── apps/
│   ├── mobile/         # React Native + Expo (SDK 58) + TypeScript + Expo Router
│   └── admin/          # React 19 + Vite + TypeScript Admin Dashboard (Vercel-ready)
├── packages/
│   └── shared/         # Shared TypeScript domain models, validation, & mock catalog
├── docs/
│   ├── ASSIGNMENT_ANALYSIS.md   # Complete breakdown of marks, rules, and requirements
│   └── IMPLEMENTATION_PLAN.md   # Prioritized tasks, dependencies, & verification matrix
├── .env.example        # Reference environment variables
├── .gitignore          # Production-grade secret and build exclusion rules
└── package.json        # Monorepo workspaces configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20+ (Verified on Node v26.4.0)
- **Package Manager**: npm v10+ (Verified on npm v12.0.2)
- **Mobile Testing**: Expo Go app on your physical Android device (or Android Emulator if Android Studio is configured)

### 1. Install Dependencies

From the repository root:
```bash
# Install admin dependencies
cd apps/admin
npm install

# Install mobile dependencies
cd ../mobile
npm install
```

### 2. Configure Environment Variables
Duplicate `.env.example` in both `apps/mobile` and `apps/admin`:
```bash
cp apps/mobile/.env.example apps/mobile/.env
cp apps/admin/.env.example apps/admin/.env
```
Fill in your test credentials (Firebase Spark project, Razorpay Test Key, etc.).

### 3. Run Applications Locally

#### Start Admin Web Dashboard:
```bash
# From repository root:
npm run start:admin

# Or from apps/admin:
cd apps/admin
npm run dev
```
The admin dashboard will be available at `http://localhost:5173`.

#### Start Mobile App:
```bash
# From repository root:
npm run start:mobile

# Or from apps/mobile:
cd apps/mobile
npm run start
```
Scan the displayed QR code with the **Expo Go** app on your Android phone, or press `w` to open in a web browser for immediate interactive testing.

---

## 📋 Features & Scoring Coverage

| Category | Requirement | Implementation Details |
| :--- | :--- | :--- |
| **Mobile App (75 pts)** | **Core Functionality (30 pts)** | Customer ordering, Dealer wholesale portal, and Admin desk |
| | **Catalog & UI (15 pts)** | 50+ realistic water purifiers, dispensers, pumps, filters, and spare parts |
| | **Code Quality (10 pts)** | Shared monorepo types, modular state management, strict TypeScript |
| | **Firebase (8 pts)** | Firebase Authentication and Cloud Firestore |
| | **Razorpay (5 pts)** | Test-mode zero-KYC payment integration |
| | **Maps / Address (4 pts)** | Free OpenStreetMap / Nominatim geocoding & address autofill |
| | **Notifications (3 pts)** | EmailJS transaction emails & SMS alerts |
| **AI Automation (25 pts)** | **Daily Workflow (10 pts)** | Scheduled autonomous cron pipeline |
| | **AI Images (8 pts)** | Hugging Face Inference API / FLUX product synthesis |
| | **AI Captions (7 pts)** | Gemini / Groq marketing copy and hashtag generator |
| **Bonus (+15 pts)** | **WhatsApp Status (+10 pts)** | WAHA Docker container integration script |
| | **Polish (+5 pts)** | Dark mode, animations, image zoom, customer referral system |

---

## 🔒 Security & Safe Foundation
- No API keys, secret credentials, or Firebase service account keys are committed to Git.
- Sensitive environment variables are kept in `.env` (strictly ignored by `.gitignore`).
- Privileged operations and secret-dependent calls are segregated to secure interfaces.

---

## ⚠️ External Dependency Notice (Instagram)
The candidate's Instagram account is currently blocked/banned by Meta. To ensure zero disruption:
- The AI generator autonomously synthesizes the image, caption, and hashtags on schedule.
- The pipeline includes the complete Meta Graph API publication code and logs staging previews into `docs/daily_posts/` with a graceful dry-run fallback.
