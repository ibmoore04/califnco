# Califnco — Round 1 Technical Assignment: Detailed Analysis

**Role:** Software Developer Hiring  
**Author / Reviewer:** Al Amin (Califnco)  
**Submission Deadline:** 25 October 2026 by 11:59 PM IST  
**Source of Truth:** Official Assignment Specification (Pages 1–3)

---

## 1. Executive Summary & Objective

The objective is to design, implement, and deploy a production-grade **E-Commerce Water Purifier System** accompanied by an **AI Social Media Automation Pipeline**. The platform caters to three distinct user archetypes:
1. **Retail Customers:** Browse a catalog of 50+ water purifier and water-filtration products/parts, place orders with Razorpay (test mode), book maintenance and installation services, receive push/email/SMS notifications, and manage their profile.
2. **Wholesale Dealers:** Access a role-protected wholesale view with dedicated bulk pricing, minimum bulk quantities, credit/bulk checkout workflows, and wholesale order tracking upon admin approval.
3. **Store Administrators:** Manage orders, process dealer verification applications (approve/reject), oversee the service desk for maintenance/installation requests, and maintain the catalog. Deployed live on Vercel.

In addition, an **AI Automation Workflow** generates daily product imagery and captions/hashtags for marketing.

---

## 2. Comprehensive Scoring Breakdown (100 Pts Base + 15 Pts Bonus)

| Category | Evaluation Criteria | Max Marks | Weight / Priority |
| :--- | :--- | :---: | :---: |
| **Mobile App (75 pts)** | **Core app functionality** (Customer, Dealer, Admin all working) | **30** | Critical (P0) |
| | **UI polish & realistic, relevant product imagery** (50+ items matched) | **15** | High (P0) |
| | **Code structure, cleanliness & architecture** | **10** | High (P1) |
| | **Firebase integration** (Auth, Firestore, FCM alerts) | **8** | High (P1) |
| | **Razorpay checkout flow** (Test mode integration) | **5** | Medium (P1) |
| | **Maps / Address integration** (Free zero-cost provider) | **4** | Medium (P2) |
| | **Email & SMS notifications working** | **3** | Medium (P2) |
| **AI Automation (25 pts)** | **Scheduled daily workflow** (Zero manual intervention) | **10** | High (P1) |
| | **AI-generated product image in post** | **8** | Medium (P1) |
| | **AI-generated caption with hashtags** | **7** | Medium (P1) |
| **Bonus (+15 pts)** | **WhatsApp Status automation** (via WAHA / Docker) | **+10** | Bonus (P2) |
| | **In-app extras** (Animations, image zoom/lightbox, referral, dark mode) | **+5** | Bonus (P2) |
| **Total Possible** | | **115 pts** | |

---

## 3. Technology Stack & Zero-Cost Tooling Matrix

The assignment strictly mandates zero-cost (₹0) tools and services. Where proprietary platforms require paid credit cards or KYC, specific free-tier alternatives are designated:

| Domain | Recommended Tooling | Selected Free Alternatives | Verification / Constraint |
| :--- | :--- | :--- | :--- |
| **Cross-Platform Mobile** | React Native / Expo | Expo SDK 58, TypeScript, Expo Router | No paid Apple/Google developer accounts needed. Testable on Expo Go Android. |
| **Admin Web Dashboard** | Web Framework | React 19 + Vite + TypeScript | Free deployment to Vercel. Responsive for desktop and mobile browsers. |
| **Shared Logic / Types** | Monorepo Package | `@califnco/shared` | Centralized schemas for Product, Order, Dealer, Service, User. |
| **Database & Auth** | Firebase | Firebase Auth & Cloud Firestore | Free Spark Plan (No credit card needed). |
| **Push Alerts** | Firebase | FCM (Firebase Cloud Messaging) / Expo Push | Free native push alerting. |
| **Product Image Hosting** | Cloudinary / ImgBB | Cloudinary / ImgBB / Unsplash curated direct CDN | Firebase Storage is excluded because it is not free without billing account. |
| **Payment Gateway** | Razorpay Test Mode | `rzp_test_*` API keys | Zero KYC and zero documents required. Pure test mode. |
| **Location & Maps** | Free Geolocation API | OpenStreetMap (Nominatim), MapTiler, or Geoapify | Google Maps is avoided (requires credit card activation). |
| **Notifications** | Email & SMS | EmailJS (Free 200 emails/mo) & TextBee (Free Android SMS Gateway) | Zero credit card requirement. |
| **AI Text Generation** | Gemini API / Groq API | Google Gemini 1.5 Flash / Groq Llama 3 | Generates high-converting marketing captions and hashtags. |
| **AI Image Generation** | Hugging Face Inference API | FLUX.1-schnell / Stable Diffusion XL via HF Inference API | High-resolution water purifier lifestyle product visuals. |
| **Automation Engine** | n8n / Scripted cron | n8n (Docker) or Node-based autonomous runner | Executes scheduled cron workflow autonomously. |
| **Bonus: WhatsApp Status** | WAHA | WhatsApp HTTP API via local Docker | Free open-source local WhatsApp Web container. |

---

## 4. Required Deliverables & Submission Format

1. **Submission Method:** Official Round 1 Submission Form (provided in candidate invitation email).
2. **Access Permissions:** Any Google Drive links, GitHub repositories, or APK/demo links must be set to **"Anyone with the link can view"** (Locked links are skipped immediately).
3. **Artifacts Expected:**
   - Public/accessible Git repository with clean commit history.
   - Deployed live URL for Admin Dashboard on Vercel.
   - Expo project QR code / link / installable Android APK for Mobile App testing.
   - Demonstration video or screenshots documenting core customer, dealer, admin, and AI automation flows.
   - Architecture documentation (`README.md`, `ASSIGNMENT_ANALYSIS.md`, `IMPLEMENTATION_PLAN.md`).

---

## 5. Explicit Constraints & Guiding Principles

- **Deadline:** 25 October 2026 at 11:59 PM IST.
- **Quality over Quantity:** A few polished, thoroughly functional features score substantially higher than an ambitious application plagued by broken state transitions or runtime errors.
- **External Dependency Status (Instagram):**
  - *Context:* The user's Instagram account is currently blocked/banned.
  - *Strategy:* The AI generation engine (image synthesis + caption/hashtag generation + scheduling) will be built and tested end-to-end to generate production-ready payloads. The Meta Graph API publisher will be cleanly decoupled with a graceful dry-run / staging preview handler, logging exact request payloads and responses without crashing or blocking the rest of the application.
- **Android Studio / Emulator:**
  - Machine environment does not have Java/Android Studio installed. Initial mobile verification will target Expo Go on Android device and Expo Web for rapid interactive UI verification, avoiding heavy multi-gigabyte emulator installations.
