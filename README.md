# 💰 Personal Budget Planner — Full Stack

A complete full-stack personal finance application with React + Spring Boot.

## Project Structure
```
fullstack/
├── frontend/   React 18 + TypeScript + Vite + Tailwind
└── backend/    Spring Boot 3.2 + MySQL + JWT
```

---

## Quick Start (3 steps)

### Step 1 — Database
```sql
-- Run in MySQL
CREATE DATABASE budget_planner_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
```

### Step 2 — Backend
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
# Running at http://localhost:8080/api
# Swagger UI: http://localhost:8080/api/swagger-ui.html
```

### Step 3 — Frontend
```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

Open **http://localhost:5173** → Register → Start tracking!

---

## Feature List
| Feature | Status |
|---|---|
| JWT Register / Login / Refresh | ✅ |
| Income CRUD | ✅ |
| Expense CRUD with 14 categories | ✅ |
| Savings Goals + Contribute | ✅ |
| Dashboard with charts | ✅ |
| Analytics (Income/Expense/Category/Savings) | ✅ |
| Dark / Light theme (persisted to DB) | ✅ |
| Profile + Password change | ✅ |
| Category filter on Expenses | ✅ |
| Responsive layout (mobile + desktop) | ✅ |
| Auto token refresh (silent) | ✅ |

---

## API Base URL
All API calls go through Vite's proxy → `http://localhost:8080/api`

To change the backend URL, edit `frontend/vite.config.ts`:
```ts
proxy: { '/api': { target: 'http://YOUR_BACKEND_HOST' } }
```
