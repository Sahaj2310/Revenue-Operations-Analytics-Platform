# Frontend — React + TypeScript

This directory contains the full frontend application built with **React 18**, **TypeScript**, **Material UI**, and **Framer Motion**.

---

## 📁 Key File Reference

### Pages (`src/pages/`)
| File | Description |
|------|-------------|
| `Dashboard.tsx` | Main landing page with KPI metrics, revenue sparkline, and recent activity |
| `Analytics.tsx` | Deep analytics view — category charts, churn scatter plot, transaction log, and PDF download button |
| `Customers.tsx` | Full customer table with search, churn risk badges, and drawer button |
| `Login.tsx` | JWT login page |
| `Register.tsx` | New user registration page |

### Components (`src/components/`)
| File | Description |
|------|-------------|
| `Sidebar.tsx` | Collapsible left-side navigation with dark theme and icon links |
| `CustomerDrawer.tsx` | Right-side drawer with customer transactions + **AI Messaging Assistant** |
| `CustomerTable.tsx` | Animated table of recent transactions using Framer Motion rows |
| `RevenueChart.tsx` | Recharts line chart for revenue over time |
| `CategoryChart.tsx` | Recharts pie chart for revenue category breakdown |
| `StatCard.tsx` | KPI metric card with label, value, and trend indicator |
| `MetricStrip.tsx` | Horizontal strip of multiple KPI stats across the dashboard header |

### Core Files
| File | Description |
|------|-------------|
| `api.ts` | All Axios HTTP calls — auth, stats, customers, analytics, AI pitch, PDF download |
| `types.ts` | TypeScript interfaces for all API response types |
| `theme.ts` | MUI custom dark theme — palette, typography, component overrides |
| `App.tsx` | Top-level routing and auth guard logic |

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

App will be available at `http://localhost:5173`.

> The frontend expects the FastAPI backend to be running at `http://localhost:8000`. (Configured in `src/api.ts`)

### 3. Build for production
```bash
npm run build
```

---

## 🎨 Design System

The app uses a **custom MUI dark theme** defined in `src/theme.ts`. Key design decisions:

| Token | Value |
|-------|-------|
| Primary color | Deep indigo (#5C6BC0) |
| Background | Dark navy (#0D1117 / #161B22) |
| Card surface | Elevated dark (#1E2530) |
| Font | Inter (Google Fonts) |
| Border radius | 12px (cards), 20px (buttons) |

---

## ✨ Animation System (Framer Motion)

Every page uses **staggered entry animations**:
```tsx
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};
```
- **Dashboard**: Metric strip and charts stagger in on load
- **Customers**: Table rows stagger in from below
- **Analytics**: Charts and data tables fade in sequentially

---

## 🔑 Authentication Flow

1. User enters credentials on `/login`
2. Frontend calls `POST /token` → receives a JWT
3. Token is stored in `localStorage`
4. Every subsequent API request includes `Authorization: Bearer <token>` (injected by Axios interceptor in `api.ts`)
5. On `401/403`, the token is cleared and user is redirected to `/login`

---

## 📡 API Calls Reference (`api.ts`)

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `fetchStats` | GET | `/stats` | Dashboard KPIs |
| `fetchAdvancedAnalytics` | GET | `/analytics/advanced` | Charts data |
| `fetchCustomers` | GET | `/customers` | Customer list |
| `fetchCustomerDetails` | GET | `/customers/{name}` | Transactions |
| `generateCustomerPitch` | POST | `/customers/{name}/generate-pitch` | AI email |
| `downloadExecutiveReport` | GET | `/reports/executive-summary` | PDF blob |
| `getForecast` | GET | `/forecast` | Revenue forecast |
| `uploadFile` | POST | `/upload` | CSV upload |
| `clearData` | DELETE | `/data` | Clear data |
