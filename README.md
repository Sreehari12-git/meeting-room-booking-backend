# Meeting Room Booking System - Backend

A robust and scalable NestJS backend API built for managing meeting rooms, employee bookings, and user administration. It features JWT-based cookie authentication, PostgreSQL database management using Prisma ORM, strict input validation, and comprehensive logging.

---

## 🚀 Tech Stack

- **Framework:** [NestJS (v11.x)](https://nestjs.com/)
- **ORM:** [Prisma (v6.x)](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Authentication:** JWT with HttpOnly cookies (`cookie-parser`)
- **Logging:** [Pino](https://github.com/pinojs/pino) (`nestjs-pino` & `pino-http`)
- **API Documentation:** [Swagger OpenAPI](https://swagger.io/)
- **Validation:** `class-validator` & `class-transformer`

---

## 🛠️ Project Setup

### 📋 Prerequisites

Ensure you have the following installed:
- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)
- **PostgreSQL** database instance (local or hosted)

### 💻 Installation

1. Navigate to the backend directory:
   ```bash
   cd MR-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### ⚙️ Environment Configuration

Create a `.env` file in the root of the `MR-backend` directory and configure the following environment variables:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# Application running port
PORT=5000

# Authentication secrets
JWT_SECRET="your-secure-access-token-secret"
JWT_REFRESH_SECRET="your-secure-refresh-token-secret"

# Allowed CORS origins (separate multiple origins with commas if necessary)
ALLOWORIGINLIST="http://localhost:5173"
```

### 🗄️ Database Setup & Migrations

Prisma schema is defined in [prisma/schema.prisma](file:///c:/MeetingRoom/MR-backend/prisma/schema.prisma). Run the following commands to apply migrations and generate the client:

```bash
# Apply migrations to PostgreSQL and create tables
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

---

## 🏃 Running the Application

| Command | Description |
| :--- | :--- |
| `npm run start` | Starts the application |
| `npm run start:dev` | Starts the application in development watch mode |
| `npm run start:prod` | Starts the production bundle (`dist/src/main.js`) |
| `npm run build` | Compiles the NestJS code into Javascript (`dist/` folder) |

---

## 🧪 Running Tests

```bash
# Unit tests
npm run test

# End-to-end (e2e) tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📖 API Documentation (Swagger)

When the server is running, the interactive Swagger API documentation is available at:
👉 **[http://localhost:5000/api](http://localhost:5000/api)** (Replace `5000` with your configured `PORT`)

---

## 🛠️ API Endpoints Summary

### 🔑 Authentication (`/auth`)
- **`POST /auth/login`**: Authenticates user and sets HttpOnly cookies (`token` and `refreshToken`).
- **`POST /auth/logout`**: Logs out the user and clears authentication cookies.
- **`POST /auth/refresh`**: Generates a new access token using the refresh token.
- **`GET /auth/me`**: Returns the current logged-in user profile (Requires authentication).

### 👥 User & Room Administration (`/admin`)
*All routes except `create-admin` require `ADMIN` role.*
- **`POST /admin/create-user`**: Creates a new User (`ADMIN` or `EMPLOYEE`).
- **`POST /admin/create-admin`**: Creates an initial Admin account.
- **`GET /admin/get-all`**: Fetches all users.
- **`PUT /admin/user/:email`**: Updates user details.
- **`DELETE /admin/user/:email`**: Deletes a user by email.
- **`POST /admin/create-rooms`**: Creates a new meeting room.
- **`GET /admin/get-rooms`**: Fetches all meeting rooms.
- **`PUT /admin/room/:name`**: Updates room details by name.
- **`DELETE /admin/room/:name`**: Deletes a room by name.

### 📅 Booking Management (`/booking`)
*Requires `EMPLOYEE` role.*
- **`POST /booking/check-availability`**: Checks if a room is available for a given time range.
- **`POST /booking/book-room`**: Books a meeting room.
- **`GET /booking/upcoming`**: Retrieves list of upcoming bookings for the logged-in employee.
- **`GET /booking/history`**: Retrieves booking history for the logged-in employee.
- **`PUT /booking/:id`**: Cancels an active booking by ID.

---

## 🗂️ Project Directory Structure

```text
MR-backend/
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma       # Database models (User, Room, Booking)
│   └── migrations/         # SQL migration scripts
├── src/
│   ├── auth/               # Authentication module, guards, and middleware
│   ├── booking/            # Booking module, services, controllers, and DTOs
│   ├── prisma/             # Database connection module
│   ├── users/              # User/Admin module, services, and controllers
│   ├── main.ts             # Application entry point & configuration
│   └── app.module.ts       # Root module defining middleware and imports
├── test/                   # E2E test suites
├── tsconfig.json           # TypeScript configuration
└── package.json            # Scripts & dependencies definition
```
