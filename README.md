# SkyCal — Smart Weather-Based Event Planner

> Plan your events around the weather, not the other way around.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)

SkyCal is a full-stack web application that helps users plan indoor and outdoor events based on real-time weather forecasts, risk analysis, and intelligent date recommendations.

---

## Features

| Category | Feature |
|---|---|
| 🔐 Auth | Firebase email/password + Google OAuth with demo mode fallback |
| 📅 Events | Full CRUD — create, view, edit, delete events |
| 🌦️ Weather | Real-time forecasts via WeatherAPI.com (mock data when no key) |
| 📊 Risk Engine | Event-type-specific 0–100 risk scoring (rain, wind, temp, UV, humidity) |
| ⭐ Smart Dates | AI-ranked best dates within your planning window |
| 📈 Charts | Temperature, humidity, rainfall, and risk charts (Recharts) |
| 🕐 Hourly | 24-hour breakdown per day with expandable tables |
| 📜 Historical | Compare this year's forecast vs last year's data |
| 🏠 Venue Tips | Indoor / outdoor / covered-outdoor recommendations |
| 🎨 UI | Dark glassmorphism theme with Framer Motion animations |

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Language | TypeScript 5 |
| Framework | React 18 + React Router 6 |
| Build Tool | Vite 5 |
| Styling | TailwindCSS 3 + Framer Motion |
| Charts | Recharts |
| Auth | Firebase SDK |
| HTTP | Axios |
| Icons | Lucide React |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Auth | Firebase Admin SDK |
| HTTP Client | Axios |

---

## Project Structure

```
skycal/
├── index.html                   # Entry HTML
├── package.json                 # Frontend dependencies
├── vite.config.ts               # Vite config
├── tailwind.config.js           # Design tokens
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment variable template
│
├── src/                         # Frontend source
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Router + providers
│   ├── config/firebase.ts       # Firebase init
│   ├── context/
│   │   ├── AuthContext.tsx      # Auth state
│   │   └── EventContext.tsx     # Event CRUD
│   ├── services/
│   │   ├── api.ts               # Axios instance
│   │   └── weatherService.ts   # Weather API + mock
│   ├── utils/
│   │   ├── riskCalculator.ts   # Risk scoring engine
│   │   └── suggestionEngine.ts # Venue suggestions
│   ├── hooks/useWeather.ts      # Weather data hook
│   ├── components/              # Reusable UI components
│   └── pages/                   # Route-level pages
│
└── server/                      # Backend source
    ├── server.js                # Express entry point
    ├── package.json             # Backend dependencies
    ├── config/db.js             # MongoDB connection
    ├── middleware/auth.js       # Firebase token verification
    ├── models/                  # Mongoose schemas
    ├── routes/                  # API routes
    ├── controllers/             # Business logic
    └── services/weatherService.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project _(optional — demo mode works without it)_
- WeatherAPI.com key _(optional — mock data used without it)_

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/skycal-weather-event-planner.git
cd skycal-weather-event-planner
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see the [Environment Variables](#environment-variables) table below).

### 3. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 4. Run the app

```bash
# Terminal 1 — Backend
cd server
node server.js        # or: npm run dev  (uses nodemon)

# Terminal 2 — Frontend
npm run dev
```

| URL | Description |
|---|---|
| http://localhost:5173 | Frontend app |
| http://localhost:5000/api/health | Backend health check |

> **Demo mode**: If no Firebase keys are configured, you can log in with any email + any password. Events are stored in `localStorage`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable | Description | Required |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key | No (demo mode) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | No |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | No |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | No |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | No |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | No |
| `VITE_WEATHER_API_KEY` | WeatherAPI.com key | No (mock data) |
| `VITE_API_BASE_URL` | Backend URL | No (default: localhost:5000) |
| `PORT` | Backend port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes (for backend) |
| `WEATHER_API_KEY` | Server-side weather key | No (mock data) |
| `CLIENT_ORIGIN` | Allowed CORS origin | No (default: localhost:5173) |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase Admin JSON | No (for real auth) |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register / sync user |
| POST | `/api/auth/login` | Login sync |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/me` | Update profile |

### Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | List events (supports `?status`, `?type`, `?search`, `?sort`) |
| POST | `/api/events` | Create event |
| GET | `/api/events/past` | Past events |
| GET | `/api/events/stats` | Dashboard stats |
| GET | `/api/events/:id` | Get single event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| POST | `/api/events/:id/analyze` | Re-run weather analysis |
| GET | `/api/events/:id/recommendations` | Get date recommendations |

---

## How the Risk Scoring Works

Each date receives a **0–100 risk score** based on weather factors weighted by event type:

| Factor | Outdoor | Wedding | Sports | Indoor |
|---|---|---|---|---|
| Rainfall | 30 | 35 | 25 | 10 |
| Wind Speed | 25 | 25 | 20 | 5 |
| Temp (high) | 20 | 15 | 25 | 5 |
| Temp (low) | 15 | 10 | 20 | 10 |
| Humidity | 10 | 5 | 5 | 0 |
| Cloud Cover | 5 | 10 | 0 | 0 |

**Risk levels:** 🟢 Low (0–29) · 🟡 Moderate (30–59) · 🔴 High (60–100)

---

## Deployment

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Framework: **Vite** | Build: `npm run build` | Output: `dist`
3. Add all `VITE_*` environment variables
4. Set `VITE_API_BASE_URL` to your backend URL

### Backend → Render
1. New Web Service → connect repo
2. Root directory: `server` | Start: `node server.js`
3. Add `MONGODB_URI`, `WEATHER_API_KEY`, `CLIENT_ORIGIN`, `FIREBASE_SERVICE_ACCOUNT_JSON`

> For `FIREBASE_SERVICE_ACCOUNT_JSON` on Render: minify your `firebase-service-account.json` and paste the entire JSON as a single-line env var.

---

## License

This project is for educational and portfolio purposes.

---

Built with ❤️ using React, TypeScript, Express, MongoDB, and Firebase
