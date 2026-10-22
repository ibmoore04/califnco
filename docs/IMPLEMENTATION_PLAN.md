# Califnco Technical Assignment: Implementation Plan & Verification Matrix

**Target Deadline:** 25 October 2026 by 11:59 PM IST  
**Scoring Potential:** 100 Base Points + 15 Bonus Points = 115 Max Points  

---

## 1. Prioritization & Phased Roadmap

| Phase | Focus Area | Points at Stake | Dependencies | Risk Level |
| :--- | :--- | :---: | :--- | :---: |
| **Phase 0** | Workspace Foundation, Architecture & Shared Types | 10 pts (Structure) | Node 26, npm 12, Git | Low |
| **Phase 1** | 50+ Water Purifier Catalog & Realistic Imagery Data | 15 pts (UI/Imagery) | CDN/Curated imagery | Low |
| **Phase 2** | Mobile Core Flows (Customer, Cart, Checkout, Service Booking) | 30 pts (Core) + 5 pts (Razorpay) | Phase 1, Firebase | Medium |
| **Phase 3** | Dealer Registration, Wholesale Pricing & Bulk Order System | 30 pts (Core share) | Phase 2, Firestore Roles | Medium |
| **Phase 4** | Web Admin Dashboard (Vercel-ready, Dealer Approval, Order Desk) | 30 pts (Core share) | Shared package, Firebase | Low |
| **Phase 5** | Maps, Address Geocoding & Notification Integrations (Email/SMS) | 7 pts (Maps 4, Alerts 3) | Free APIs (Nominatim/EmailJS) | Low |
| **Phase 6** | AI Social Media Automation Pipeline (Image Gen + Captions) | 25 pts (AI Automation) | Gemini/HF Inference API | Medium (IG Banned) |
| **Phase 7** | Polish & Bonus Deliverables (Dark mode, Zoom, WAHA, Referrals) | 15 pts (Bonus) | Core UI working | Low |

---

## 2. Requirements-to-Implementation & Verification Matrix

### Category A: Mobile Application (75 Points)

#### 1. Core Architecture & Monorepo Foundation (10 pts)
- **Implementation:**
  - Standardized monorepo with `apps/mobile`, `apps/admin`, and `packages/shared`.
  - Type-safe domain models for `Product`, `Order`, `DealerProfile`, `ServiceBooking`, and `UserProfile`.
  - Clean separation of UI components, hooks, services, and route screens.
- **Verifiable Test:**
  - TypeScript type check (`tsc --noEmit`) passes with 0 errors across all workspaces.
  - Lint check passes cleanly.

#### 2. Realistic 50+ Water Purifier Catalog & Clean UI (15 pts)
- **Implementation:**
  - Curated 50+ item catalog categorized into:
    1. *Purifiers* (RO, UV, UF, Alkaline, Commercial RO)
    2. *Dispensers* (Hot & Cold, Bottom-load, Desktop)
    3. *Pumps* (Booster pumps 75 GPD/100 GPD, diaphragm pumps)
    4. *Filters* (Sediment, Pre-carbon, Post-carbon, RO membranes, Mineral cartridges)
    5. *Spares* (Solenoid valves, SMPS power supplies, float valves, connectors, housings)
  - Realistic, verified high-resolution images matching every product title.
  - Clean product cards, category pills, filter & search bar, stock badges, and detail view.
- **Verifiable Test:**
  - Catalog renders exactly 50+ unique items across the 5 required categories.
  - No broken image URLs or placeholder gray boxes; all images visually match product specifications.

#### 3. Customer E-Commerce Flow (Core 30 pts share)
- **Implementation:**
  - Interactive Cart: Add/remove, quantity stepper, price recalculation.
  - Checkout screen: Address collection with free geocoding assistance, order review.
  - Order History: Tab/screen listing past orders with real-time status tracker (`pending` -> `processing` -> `shipped` -> `delivered`).
  - Service Booking Desk: Form for booking installation, periodic filter replacement, maintenance, or repair.
  - User Profile: Authentication status, personal details, past orders link, support link.
- **Verifiable Test:**
  - Add 2 items to cart -> proceed to checkout -> submit order -> view created order in Order History screen with initial `pending` state.
  - Submit service booking for "Filter Replacement" -> appears under active service bookings.

#### 4. Dealer Portal & Wholesale Bulk Pricing (Core 30 pts share)
- **Implementation:**
  - Dealer Registration: Company name, GST number, contact person, phone, business address.
  - Role Gate & Approval Lifecycle: Initial status `pending`. Dealer cannot access wholesale pricing until Admin approves.
  - Wholesale Experience: Once `approved`, catalog switches prices to lower wholesale tier and enforces minimum order quantities (MOQ).
  - Bulk Checkout: Custom bulk order review with wholesale tax computation.
- **Verifiable Test:**
  - Register new dealer user -> Login -> Verify banner states "Account Pending Admin Approval" with standard retail pricing visible.
  - Approve dealer via Admin Dashboard -> Refresh dealer app -> Verify wholesale price tags appear and MOQ validation is active.

#### 5. Razorpay Checkout Flow (5 pts)
- **Implementation:**
  - Razorpay Test Mode integration using standard `rzp_test_*` credentials.
  - Web & mobile checkout modal trigger (zero KYC needed).
  - Test payment simulation (Success / Failure handlers) updating Firestore order `paymentStatus: 'paid'`.
- **Verifiable Test:**
  - Initiate test payment -> Complete with test card (`4111...`) or simulated UPI -> Order status transitions to `paid` with `razorpayPaymentId` stored.

#### 6. Maps & Address Integration via Free Alternative (4 pts)
- **Implementation:**
  - OpenStreetMap (Nominatim API) / Geoapify integration for zero-cost address autocomplete and reverse geocoding.
  - Coordinate selection without requiring Google Maps paid billing accounts.
- **Verifiable Test:**
  - Type delivery street or city -> Autocomplete suggestions populate from free provider -> Coordinates and formatted address autofill in checkout form.

#### 7. Email & SMS Notifications (3 pts)
- **Implementation:**
  - EmailJS client integration for transactional order confirmations and dealer approval notices.
  - TextBee / SMS webhook interface for SMS dispatch.
- **Verifiable Test:**
  - Trigger order placement -> Email notification function dispatches template payload with order summary.

#### 8. Firebase Integration (Auth, Firestore, FCM Alerts) (8 pts)
- **Implementation:**
  - Firebase Authentication for email/password and role assignment.
  - Firestore Collections: `products`, `orders`, `dealers`, `services`, `users`.
  - FCM / Expo Notifications integration for order updates and dealer approval alerts.
- **Verifiable Test:**
  - User sign up & login creates Firestore record with role.
  - Firestore security rules protect dealer bulk pricing updates and admin operations.

---

### Category B: Admin Web Dashboard (Core 30 pts share + Vercel Deployment)

- **Implementation:**
  - Responsive web application built with React 19, Vite, and modern styling.
  - **Orders Management:** Table of all customer & dealer orders, status selector (`shipped`, `delivered`, etc.), payment filter.
  - **Dealer Desk:** List pending dealer applications with business credentials, 1-click "Approve" or "Reject" buttons.
  - **Service Desk:** Table of customer service and maintenance requests, assign technician, mark completed.
  - **Catalog Overview:** View and edit product stock and pricing.
  - Vercel deployment configuration (`vercel.json`).
- **Verifiable Test:**
  - Production build (`npm run build`) runs cleanly without bundling errors.
  - Deployed live URL operates seamlessly against the shared Firestore database.

---

### Category C: AI Social Media Automation (25 Points)

#### 1. Daily Autonomous Scheduled Workflow (10 pts)
- **Implementation:**
  - Node.js cron / n8n workflow script configured to run daily without manual input.
  - Selects featured product from the 50+ item catalog.
- **Verifiable Test:**
  - Script executes autonomously on schedule or manual run trigger, reads product, invokes generators, and saves daily post artifact.

#### 2. AI-Generated Product Image (8 pts)
- **Implementation:**
  - Generates realistic water purifier lifestyle imagery using Hugging Face Inference API (FLUX / SDXL) or Gemini multimodal image pipeline.
  - Uploads generated image to public image host (ImgBB / Cloudinary) for public accessibility.
- **Verifiable Test:**
  - Pipeline produces a valid, publicly accessible image URL of a modern water purifier in a contemporary kitchen.

#### 3. AI-Generated Caption & Hashtags (7 pts)
- **Implementation:**
  - Gemini API / Groq API prompt designed for water purification e-commerce marketing.
  - Produces engaging copy: Hook, product benefit highlights, specifications, call-to-action, and optimized hashtags (`#WaterPurifier #CleanWater #Health #ROWaterPurifier #Califnco`).
- **Verifiable Test:**
  - Generated output contains compelling promotional copy and relevant hashtags matching the selected product.

#### 4. External Social Publishing Strategy (Instagram Account Status Handling)
- **Constraint:** Candidate's Instagram account is currently banned/blocked by Meta.
- **Implementation:**
  - The pipeline includes the full Meta Graph API client and payload formatter for `POST /{ig-user-id}/media` and `POST /{ig-user-id}/media_publish`.
  - Safe Dry-Run Mode / Staging Preview: When Meta tokens are missing or account is blocked, the workflow writes the post to `docs/daily_posts/` and an in-app "AI Marketing Preview" panel, logging exact API requests and responses.
  - Transparent documentation stating the external account status to the Califnco review team while demonstrating 100% operational code readiness.

---

### Category D: Bonus Points (+15 Points)

1. **WhatsApp Status Automation via WAHA (+10 pts):**
   - Provide a Docker-ready WAHA (WhatsApp HTTP API) integration script capable of posting the daily generated image and caption directly to WhatsApp Status.
2. **App Polish Extras (+5 pts):**
   - Dark mode toggle with persistent user preference.
   - Smooth micro-animations and transitions on cart/card interactions.
   - Image Lightbox / pinch-to-zoom on product specifications.
   - Customer referral code generation and tracking.

---

## 3. Immediate Next Execution Steps

1. Verify environment prerequisites and install dependencies for `apps/admin` and `packages/shared`.
2. Populate the 50+ item realistic water purifier catalog in `packages/shared`.
3. Construct the React/Vite Admin Dashboard to ensure immediate verification and Vercel-ready deployability.
4. Construct the Expo Mobile App screens with Customer, Dealer, and Service Booking flows.
5. Build the AI automation workflow script and verification test harness.
