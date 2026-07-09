# 🏋️ Shivaay Nutrition - Premium supplement store

Shivaay Nutrition is a premium 3D supplement storefront and administrative dashboard application built with **Next.js 16 (App Router)**, **TypeScript**, **Framer Motion**, and **Express.js**.

---

## 📂 Project Structure

```bash
Shivaay/
│
├── backend/                  # Express.js REST API Server
│   ├── data/                 # JSON file fallback database store
│   ├── middleware/           # Auth validation, rate limiters
│   ├── models/               # MongoDB Mongoose schemas (User, Product, Order, Otp)
│   ├── routes/               # API endpoints (Auth, Admin, Products, Orders, AI, Stats)
│   ├── services/             # Database routing, email services
│   ├── server.js             # Main backend API entrypoint
│   └── package.json
│
├── public/                   # Static storefront media & images
│
├── src/                      # Next.js Frontend App
│   ├── app/                  # App Router pages (storefront, admin dashboard, loading/errors)
│   ├── components/           # Reusable UI (ProductCard, FaqSection, AiAssistant, Navbar)
│   ├── config.ts             # Store metadata and URL parameters
│   ├── services/             # API connection and fetching client wrappers
│   └── store/                # Global Zustand stores (Auth tokens)
│
├── package.json              # Root dependencies and script commands
└── README.md
```

---

## ⚙️ Environment Variables Config Checklist

### Frontend Environment (`.env.local`)
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_OWNER_PHONE=+919999988888
NEXT_PUBLIC_OWNER_WHATSAPP=919999988888
NEXT_PUBLIC_OWNER_EMAIL=contact@shivaaynutrition.com

NEXT_PUBLIC_STORE_ADDRESS=1st floor, Omaxe plaza, Omaxe City, Sonipat, Haryana 131027

NEXT_PUBLIC_MAPS_URL=https://maps.app.goo.gl/xxx
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Backend Environment (`backend/.env`)
Create a `.env` file in the `backend/` directory:

```env
PORT=5001

# JWT Secret - Strictly required in production
JWT_SECRET=your_production_secure_jwt_secret_key_here

# MongoDB Connection String (leave blank to fall back to JSON file storage in backend/data/)
MONGODB_URI=mongodb+srv://...

# Google OAuth Keys
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Models (Optional - chatbot will use local matching fallback engine if keys are omitted)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Email Server Settings (SMTP - for Admin OTP delivery)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
ADMIN_EMAIL=shivaaynutrition190@gmail.com
```

---

## 🚀 Local Installation & Setup

### 1. Clone & Set Up Directory
```bash
git clone <repository-url>
cd Shivaay
```

### 2. Install & Start Backend Service
```bash
cd backend
npm install
npm run dev
```
*The backend API will run on `http://localhost:5001`.*

### 3. Install & Start Frontend Showcase
Open a new terminal window at the root folder:
```bash
npm install
npm run dev
```
*The storefront UI will launch on `http://localhost:3000`.*

---

## 🛡️ Production Security Checklist

- [x] **Strict JWT Secret Enforcement:** Server will refuse to boot up and exit with code `1` if `JWT_SECRET` is missing.
- [x] **Secure JWT Verification:** Enforced signature verification with `HS256` explicitly to block algorithm confusion attacks.
- [x] **Server-Side Pricing Checks:** The order amount is computed directly from verified database records. Client-provided prices and totals are completely ignored.
- [x] **Quantity Boundary Limits:** Orders must pass strict range checks (only positive integers greater than 0 and less than or equal to 100 items).
- [x] **Direct Object Reference (IDOR) Shield:** Enforced user profile ownership matching on order submissions.
- [x] **Mass Assignment Defense:** Update queries use strict allow-lists of editable fields.
- [x] **API Rate Limiting:** Configured rate limits protecting auth, admin, orders, AI chat, and OTP routes.
- [x] **HTTP Secure Headers:** Implemented Express `helmet` configuration.
- [x] **Atomic Transactions:** Stock decrement operations use MongoDB atomic queries to prevent race conditions during concurrent checkouts.