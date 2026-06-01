# Personal Budget Planner — Spring Boot Backend

## Tech Stack
| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2.5 |
| Security | Spring Security + JWT (JJWT 0.12.5) |
| Database | MySQL 8.x |
| ORM | Spring Data JPA / Hibernate |
| Mapping | MapStruct 1.5.5 |
| Boilerplate | Lombok |
| Build | Maven |
| API Docs | SpringDoc OpenAPI 3 / Swagger UI |

---

## Project Structure
```
src/main/java/com/budgetplanner/
├── BudgetPlannerApplication.java
├── config/
│   ├── ApplicationConfig.java       # AuthManager, PasswordEncoder beans
│   ├── CorsConfig.java              # CORS — update origins for production
│   ├── OpenApiConfig.java           # Swagger config with JWT bearer
│   └── SecurityConfig.java          # Spring Security filter chain
├── constants/
│   └── AppConstants.java            # API paths, messages, defaults
├── controller/
│   ├── AuthController.java          # /v1/auth/*
│   ├── IncomeController.java        # /v1/incomes/*
│   ├── ExpenseController.java       # /v1/expenses/*
│   ├── GoalController.java          # /v1/goals/*
│   ├── AnalyticsController.java     # /v1/analytics/*
│   └── UserController.java          # /v1/users/*
├── dto/
│   ├── request/                     # Inbound validated payloads
│   └── response/                    # Outbound JSON responses
├── entity/
│   ├── BaseEntity.java              # Auditable createdAt/updatedAt
│   ├── User.java                    # UserDetails implementation
│   ├── Income.java
│   ├── Expense.java
│   ├── Goal.java
│   ├── Frequency.java               # Enum: WEEKLY/BIWEEKLY/MONTHLY/YEARLY
│   └── ExpenseCategory.java         # Enum: 14 categories
├── exception/
│   ├── GlobalExceptionHandler.java  # @RestControllerAdvice
│   ├── ResourceNotFoundException.java
│   ├── BadRequestException.java
│   ├── DuplicateResourceException.java
│   └── UnauthorizedException.java
├── mapper/                          # MapStruct interfaces
├── repository/                      # Spring Data JPA repositories
├── response/
│   └── ApiResponse.java             # Unified { success, message, data, errors }
├── security/
│   ├── JwtService.java              # Token generation & validation
│   ├── JwtAuthenticationFilter.java # OncePerRequestFilter
│   ├── JwtAuthEntryPoint.java       # 401 JSON handler
│   └── UserDetailsServiceImpl.java
├── service/                         # Interfaces
└── service/impl/                    # Implementations
```

---

## Prerequisites
- Java 17+
- Maven 3.9+
- MySQL 8.x

---

## Database Setup

```sql
CREATE DATABASE budget_planner_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'budgetuser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON budget_planner_db.* TO 'budgetuser'@'localhost';
FLUSH PRIVILEGES;
```

Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/budget_planner_db?...
spring.datasource.username=budgetuser
spring.datasource.password=yourpassword
```

Hibernate will auto-create all tables on first run (`ddl-auto=update`).

---

## Build & Run

```bash
# Clone / extract project
cd budget-planner-backend

# Build (skip tests for first run)
mvn clean install -DskipTests

# Run
mvn spring-boot:run

# Or run the JAR
java -jar target/budget-planner-backend-1.0.0.jar
```

Server starts at: **http://localhost:8080/api**

---

## Swagger UI

Visit: **http://localhost:8080/api/swagger-ui.html**

- Click **Authorize** → paste `Bearer <token>` (get token from `/v1/auth/login`)
- All protected endpoints are fully documented

---

## API Endpoints

### Auth — `/api/v1/auth`
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/register` | ✗ | Register new user |
| POST | `/login` | ✗ | Login and get JWT |
| POST | `/refresh-token` | ✗ | Refresh access token |

### Income — `/api/v1/incomes`
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/` | ✓ | Get all incomes (sorted newest first) |
| GET | `/paged?page=0&size=10&sortBy=date&sortDir=desc` | ✓ | Paginated incomes |
| GET | `/{id}` | ✓ | Get income by ID |
| POST | `/` | ✓ | Create income |
| PUT | `/{id}` | ✓ | Update income |
| DELETE | `/{id}` | ✓ | Delete income |

### Expenses — `/api/v1/expenses`
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/` | ✓ | Get all expenses |
| GET | `/paged?page=0&size=10` | ✓ | Paginated expenses |
| GET | `/{id}` | ✓ | Get expense by ID |
| POST | `/` | ✓ | Create expense |
| PUT | `/{id}` | ✓ | Update expense |
| DELETE | `/{id}` | ✓ | Delete expense |

### Goals — `/api/v1/goals`
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/` | ✓ | Get all goals (sorted by deadline) |
| GET | `/paged` | ✓ | Paginated goals |
| GET | `/{id}` | ✓ | Get goal by ID |
| POST | `/` | ✓ | Create goal |
| PUT | `/{id}` | ✓ | Update goal |
| PATCH | `/{id}/contribute` | ✓ | Add funds to goal |
| DELETE | `/{id}` | ✓ | Delete goal |

### Analytics — `/api/v1/analytics`
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/dashboard` | ✓ | Dashboard totals, recent records, goals |
| GET | `/?months=6` | ✓ | Full analytics: charts + category breakdown |

### User — `/api/v1/users`
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/me` | ✓ | Get current user profile |
| PUT | `/me` | ✓ | Update name + theme preference |
| PATCH | `/me/theme` | ✓ | Toggle light/dark theme |
| PATCH | `/me/password` | ✓ | Change password |

---

## Request / Response Examples

### Register
```json
POST /api/v1/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "userId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "theme": "LIGHT"
  }
}
```

### Create Income
```json
POST /api/v1/incomes
Authorization: Bearer <token>
{
  "source": "Salary",
  "amount": 5000.00,
  "date": "2024-06-01",
  "recurring": true,
  "frequency": "MONTHLY"
}
```

### Create Expense
```json
POST /api/v1/expenses
Authorization: Bearer <token>
{
  "category": "FOOD",
  "description": "Weekly groceries",
  "amount": 120.50,
  "date": "2024-06-05",
  "recurring": false
}
```

### Create Goal
```json
POST /api/v1/goals
Authorization: Bearer <token>
{
  "name": "Emergency Fund",
  "targetAmount": 10000.00,
  "currentAmount": 2500.00,
  "deadline": "2024-12-31"
}
```

### Contribute to Goal
```json
PATCH /api/v1/goals/1/contribute
Authorization: Bearer <token>
{
  "amount": 500.00
}
```

---

## Frontend Integration

### Where to update the base URL

In your React frontend, replace any `localStorage`-based calls with Axios HTTP calls.

Create `src/services/api.ts`:
```typescript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
```

Replace `BudgetContext` localStorage calls:
```typescript
// Income
export const getIncomes    = () => API.get('/incomes');
export const createIncome  = (data) => API.post('/incomes', data);
export const updateIncome  = (id, data) => API.put(`/incomes/${id}`, data);
export const deleteIncome  = (id) => API.delete(`/incomes/${id}`);

// Expense
export const getExpenses   = () => API.get('/expenses');
export const createExpense = (data) => API.post('/expenses', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Goals
export const getGoals      = () => API.get('/goals');
export const createGoal    = (data) => API.post('/goals', data);
export const updateGoal    = (id, data) => API.put(`/goals/${id}`, data);
export const deleteGoal    = (id) => API.delete(`/goals/${id}`);
export const contributeGoal = (id, amount) => API.patch(`/goals/${id}/contribute`, { amount });

// Analytics
export const getDashboard  = () => API.get('/analytics/dashboard');
export const getAnalytics  = (months=6) => API.get(`/analytics?months=${months}`);

// Auth
export const login         = (data) => API.post('/auth/login', data);
export const register      = (data) => API.post('/auth/register', data);
```

---

## CORS Configuration

Allowed origins (update `CorsConfig.java` for production):
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `http://localhost:4173` (Vite preview)

For production, replace with your deployed frontend URL.

---

## JWT Configuration

| Property | Value | Description |
|---|---|---|
| `jwt.expiration` | 86400000 ms | Access token: 24 hours |
| `jwt.refresh-token.expiration` | 604800000 ms | Refresh token: 7 days |

Generate a secure 256-bit key for production and replace `secret-key` in `application.properties`.

---

## Database ER Diagram

```
users (1) ──────< incomes (many)
      (1) ──────< expenses (many)
      (1) ──────< goals (many)
```

All child records are cascade-deleted when a user is deleted.
