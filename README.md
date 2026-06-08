# 🏋️ Shivaay Nutrition

A premium 3D supplement store website built with Next.js, TypeScript, Tailwind CSS, Framer Motion, Three.js, and AI-powered customer assistance.

The platform is designed for modern supplement stores to showcase products, manage orders, interact with customers through an AI assistant, and provide a luxury showroom experience.

---

## ✨ Features

### 🎨 Premium 3D UI
- Modern fitness-themed design
- Smooth animations using Framer Motion
- Three.js interactive elements
- Premium black, gold, and orange color palette

### 🛍 Product Management
- Browse supplement products
- Product categories
- Product search and filtering
- Featured brands section

### 🤖 AI Fitness Assistant
- AI-powered customer support
- Product recommendations
- Supplement guidance
- Order status assistance
- Voice input support
- Text-to-speech responses

### 👤 Authentication
- User Registration
- User Login
- Google Authentication
- Protected User Dashboard

### 📦 Order Management
- Place Orders
- Track Orders
- Order History
- Customer Purchase Records

### 📍 Store Information
- Google Maps Integration
- Store Location Page
- Contact Information
- WhatsApp Integration

### 📱 Fully Responsive
- Mobile Friendly
- Tablet Friendly
- Desktop Optimized

---

## 🛠 Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js
- React Three Fiber
- Zustand

### Backend
- Node.js
- Express.js
- REST APIs

### Additional Libraries
- GSAP
- Lucide React Icons
- React Three Drei

---

## 📂 Project Structure

```bash
Shivaay/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── products/
│   │   ├── contact/
│   │   ├── location/
│   │   ├── offers/
│   │   └── admin/
│   │
│   ├── components/
│   │   ├── AiAssistant.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ThreeScene.tsx
│   │   └── FloatingCTA.tsx
│   │
│   ├── services/
│   ├── store/
│   └── config.ts
│
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory.

```env
NEXT_PUBLIC_OWNER_PHONE=+91XXXXXXXXXX
NEXT_PUBLIC_OWNER_WHATSAPP=91XXXXXXXXXX
NEXT_PUBLIC_OWNER_EMAIL=contact@shivaaynutrition.com

NEXT_PUBLIC_STORE_ADDRESS=Your Store Address

NEXT_PUBLIC_MAPS_URL=https://maps.google.com/...
NEXT_PUBLIC_API_URL=http://localhost:5001
```

Backend environment variables:

```env
PORT=5001

JWT_SECRET=your_secret_key

MONGODB_URI=your_mongodb_connection_string

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

OPENAI_API_KEY=your_ai_api_key
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/shivaay-nutrition.git
```

### Install Frontend Dependencies

```bash
npm install
```

### Install Backend Dependencies

```bash
cd backend

npm install
```

---

## ▶ Running The Project

### Start Backend

```bash
cd backend

npm run dev
```

Backend:

```bash
http://localhost:5001
```

### Start Frontend

```bash
npm run dev
```

Frontend:

```bash
http://localhost:3000
```

---

## 🏪 Pages

### Home
- Hero Section
- Product Highlights
- Customer Statistics
- Brand Showcase
- AI Assistant

### Products
- Product Listings
- Search
- Category Filters

### Offers
- Current Deals
- Promotions

### Contact
- Contact Form
- WhatsApp Integration

### Location
- Store Directions
- Google Maps

### Admin
- Product Management
- Order Monitoring

---

## 🤖 AI Assistant Capabilities

The built-in AI Assistant can:

- Recommend supplements
- Answer fitness-related queries
- Explain protein and creatine usage
- Check order status
- Provide store timings
- Assist customers through voice and text interactions

---

## 📸 Business Use Cases

Perfect for:

- Supplement Stores
- Nutrition Shops
- Fitness Brands
- Gym Merchandise Stores
- Health & Wellness Businesses

---

## 🔒 Security Features

- JWT Authentication
- Protected Routes
- Secure API Communication
- Environment Variable Protection

---

## 📈 Future Enhancements

- Online Payments
- Inventory Management
- Loyalty Rewards Program
- Personalized AI Recommendations
- Multi-store Support
- Mobile Application

---

## 👨‍💻 Developed By

**Pulkit Antil**

Premium AI, Web3, Blockchain, and Modern Web Solutions.

---

## 📄 License

This project is licensed under the MIT License.

© 2026 Shivaay Nutrition. All Rights Reserved.