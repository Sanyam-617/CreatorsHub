# CreatorHub — Social Media Analytics Dashboard

A full-stack MERN application that helps content creators track, analyze, and predict their social media performance across multiple platforms.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Frontend:** React + Vite (in progress)

---

## Folder Structure

```
creatorhub-backend/
└── src/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── analyticscontroller.js
    │   ├── authcontroller.js
    │   ├── insightcontroller.js
    │   └── platformcontroller.js
    ├── middleware/
    │   └── authmiddleware.js
    ├── models/
    │   ├── analytics.js
    │   ├── insight.js
    │   ├── platform.js
    │   ├── upload.js
    │   └── user.js
    ├── routes/
    │   ├── analyticsroutes.js
    │   ├── authRoutes.js
    │   ├── dashboardroutes.js
    │   ├── insightroutes.js
    │   └── platformroutes.js
    ├── utils/
    │   ├── logger.js
    │   └── regression.js
    └── server.js
```

---

## How to Run

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/creatorhub.git
cd creatorhub-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a `.env` file in the root of `creatorhub-backend`
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 4. Start the development server
```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |

### Platforms
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/platforms` | Add a platform | Yes |
| GET | `/api/platforms` | Get all platforms for user | Yes |
| DELETE | `/api/platforms/:id` | Delete a platform | Yes |

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/analytics` | Add an analytics entry | Yes |
| GET | `/api/analytics/:platformId` | Get all entries for platform | Yes |
| GET | `/api/analytics/:platformId/summary` | Get summary stats | Yes |
| GET | `/api/analytics/:platformId/growth` | Get weekly growth % | Yes |
| GET | `/api/analytics/:platformId/engagement-score` | Get engagement score | Yes |
| GET | `/api/analytics/:platformId/trend` | Get trend classification | Yes |
| GET | `/api/analytics/:platformId/predict` | Get next 4 weeks prediction | Yes |
| GET | `/api/analytics/:platformId/backtest` | Get backtest accuracy | Yes |
| DELETE | `/api/analytics/:uploadId` | Delete analytics by upload | Yes |

### Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/:platformId` | Get full frontend-ready dashboard data | Yes |

### Insights
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/insights` | Add an insight | Yes |
| GET | `/api/insights/:platformId` | Get all insights for platform | Yes |
| DELETE | `/api/insights/:id` | Delete an insight | Yes |

---

## Key Features

- **JWT Authentication** — secure register/login, all private routes protected
- **Platform Management** — add YouTube, Instagram, Twitter, Facebook
- **Analytics CRUD** — with auto engagement rate calculation on every entry
- **Input Validation** — rejects negative values, future dates, zero followers, duplicate entries
- **Engagement Scoring** — Excellent / Good / Average / Poor based on avg engagement rate
- **Trend Classification** — Growing / Declining / Stable based on latest two entries
- **Weekly Growth %** — views, followers, and engagement growth between last two entries
- **Linear Regression Prediction** — predicts next 4 weeks of followers and views (R² = 0.9983)
- **Backtesting** — validates model accuracy against real data (99.58% accuracy)
- **Dashboard Endpoint** — single endpoint returns all data frontend needs, pre-calculated
- **Structured Logging** — INFO / WARN / ERROR logs on every controller action

---

## Dashboard Response Example

```json
{
  "success": true,
  "overview": {
    "latestFollowers": 5500,
    "latestViews": 12000,
    "latestEngagementRate": 6.5,
    "avgEngagementRate": "6.50",
    "dataPoints": 2
  },
  "engagementScore": "Good",
  "trend": "Growing",
  "weeklyGrowth": {
    "viewsGrowth": "20.00",
    "followersGrowth": "10.00",
    "engagementGrowth": "0.00"
  },
  "prediction": {
    "nextWeekFollowers": 6000,
    "nextWeekViews": 14000,
    "modelAccuracy": "Strong",
    "followerR2": 1
  },
  "backtestAccuracy": "99.58%"
}
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Port to run the server on (default: 5000) |