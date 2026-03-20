<div align="center">
  <img src="/logo.svg" width="120" alt="LiftLegend Logo" />
  <h1>🏋️‍♂️ LiftLegend OS</h1>
  <p><b>The Ultimate Gym Management Platform for Bangladesh</b></p>
  
  [![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://liftlegend.com)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
</div>

---

## 🏗️ About the Project

**LiftLegend OS** is a high-performance, mobile-first SaaS platform designed specifically for gym owners in Bangladesh. It solves the pain points of manual attendance tracking, payment management, and member retention in the local fitness industry.

### 🌟 Key Features

- **📱 Mobile-First Dashboard**: Optimized for gym owners on the move (Dhaka, Chittagong, Sylhet).
- **🛡️ QR Entry System**: automated check-ins with dynamic QR code generation.
- **💰 Localized Payments**: Track bKash, Nagad, Cash, and Card payments with BDT currency support.
- **📊 Advanced Analytics**: Real-time revenue insights, occupancy tracking, and churn prediction.
- **📋 Member Management**: Deep member profiles with history, status tracking, and automated expiry alerts.
- **⚡ Super-Fast UX**: Skeleton loaders, server-side search, and debounced inputs for zero-latency feel.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend-as-a-Service**: Supabase (Auth, Postgres, Realtime, Storage)
- **State Management**: React Context + Hooks
- **Icons & Typography**: Material Symbols, Manrope Font
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- NPM or PNPM
- A Supabase Project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shorupghosh/liftlegend.git
   cd liftlegend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: Every database query is restricted to the specific gym (tenant isolation).
- **JWT Auth**: Secure login powered by Supabase Auth with PKCE flow.
- **Data Encryption**: Member data is encrypted at rest and in transit.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ for the Bangladesh Fitness Industry</p>
  <p>Finalized & Optimized by Antigravity</p>
</div>
