# Rent-a-Tool Community Library

A platform for communities to share and rent tools from each other. List your tools, browse what's available, book what you need, and return when you're done.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS v4
- **Backend:** Express.js + Mongoose
- **Database:** MongoDB Atlas
- **Auth:** JWT (access + refresh tokens), Google OAuth

## Project Structure

```
rent-a-tool/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios instance and API helpers
│       ├── pages/       # Page components
│       ├── components/  # Reusable UI components
│       └── App.jsx
├── server/          # Express backend
│   └── src/
│       ├── config/      # DB connection, env config
│       ├── modules/     # Feature modules (auth, tools, bookings)
│       ├── middleware/   # Auth, RBAC, error handling
│       ├── utils/       # Shared utilities
│       ├── app.js       # Express app setup
│       └── server.js    # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (free tier works)

### Setup

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd rent-a-tool
   ```

2. **Server**
   ```bash
   cd server
   cp .env.example .env    # Fill in your values
   npm install
   npm run dev
   ```

3. **Client**
   ```bash
   cd client
   cp .env.example .env    # Fill in your values
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` — you should see the health-check status confirming backend + database connectivity.

## Environment Variables

See `.env.example` in both `client/` and `server/` for required variables. **Never commit `.env` files.**
