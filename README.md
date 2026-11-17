# Roomie 🏡

**Roomie** is a roommate matching, apartment listing, and co-living household management platform built as a TypeScript monorepo.

---

## 📦 Project Structure

```
roomie/
├── apps/
│   ├── api/            # REST & Socket.io Backend (Express + TypeScript + Vitest)
│   └── mobile/         # Mobile Application (Expo SDK 58 + Expo Router + React Native)
├── packages/
│   └── shared/         # Shared Zod schemas, TypeScript types, and compatibility engine
└── package.json        # Monorepo workspaces config
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
Seeds 5 rich demo roommate profiles, active apartment listings, matches, message history, household chores, and expenses:
```bash
npm run seed
```

### 3. Run Backend API
Starts the Express & Socket.io server on `http://localhost:4000` with hot-reloading:
```bash
npm run dev:api
```

### 4. Run Mobile App
Starts the Expo development server:
```bash
npm run dev:mobile
```

---

## 🔑 Pre-configured Demo Accounts

All demo accounts share the password: **`password123`**

| Name | Email | City | Occupation | Search Status |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Chen** | `alex@roomie.local` | San Francisco, CA | Software Engineer | Looking for room ($1.4k–$2.2k) |
| **Maya Patel** | `maya@roomie.local` | San Francisco, CA | Product Designer | Has Mission Loft ($1.6k–$2.3k) |
| **Jordan Taylor** | `jordan@roomie.local` | New York, NY | Data Scientist | Looking in NYC ($1.5k–$2.4k) |
| **Elena Rostova** | `elena@roomie.local` | Seattle, WA | PhD Student | Looking in Seattle ($1.0k–$1.6k) |
| **Marcus Williams** | `marcus@roomie.local` | San Francisco, CA | Photographer | Teaming up ($1.8k–$2.6k) |

---

## 🧪 Testing & Verification

- **Run Automated Tests**:
  ```bash
  npm run test
  ```
  Runs 17 Vitest integration and unit tests covering authentication, roommate matching, listing search, real-time chat, household chores, expense splitting, and compatibility scoring.

- **TypeScript Typecheck**:
  ```bash
  npm run typecheck
  ```
  Typechecks all three workspaces (`@roomie/shared`, `@roomie/api`, `mobile`).

- **Build**:
  ```bash
  npm run build
  ```
  Compiles `@roomie/shared` and `@roomie/api` to production-ready JavaScript in `dist/`.

---

## 📡 API Endpoints Summary

- **Healthcheck**: `GET /health`
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/me`
- **Roommate Matching**:
  - `GET /api/roommates/candidates` (returns ranked candidates with compatibility % and trait breakdowns)
  - `POST /api/roommates/swipe` (like/pass; automatically creates match & conversation on mutual like)
  - `GET /api/roommates/matches` (list all mutual roommate matches)
  - `GET /api/roommates/:id` (detailed profile & compatibility analysis)
- **Apartment Listings**:
  - `GET /api/listings` (filter by `city`, `minPrice`, `maxPrice`, `roomType`, `amenities`)
  - `GET /api/listings/:id`
  - `POST /api/listings` (authenticated host)
  - `GET /api/listings/user/my-listings`
- **Chat & Socket.io**:
  - `GET /api/chat/conversations`
  - `GET /api/chat/conversations/:id/messages`
  - `POST /api/chat/conversations/messages`
  - WebSocket Events: `join_conversation`, `send_message`, `new_message`, `typing_start`, `typing_stop`
- **Roomie Hub (Shared Living)**:
  - `GET /api/hub/chores`, `POST /api/hub/chores`, `PATCH /api/hub/chores/:id`
  - `GET /api/hub/expenses` (balance breakdown of who owes whom), `POST /api/hub/expenses`, `PATCH /api/hub/expenses/:id/settle`
