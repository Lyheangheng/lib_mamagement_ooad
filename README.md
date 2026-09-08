# Library Management System (Demo Web Application)

> **Academic Project Notice**: This project is developed as an academic Object-Oriented Analysis & Design (OOAD) university coursework demonstration website.

---

## 📌 Project Overview & Purpose

The **Library Management System** is a web-based demonstration platform designed to model essential library operations according to formal Object-Oriented Analysis & Design (OOAD) specifications.

### Key Domain Rules & Parameters

* **User Roles**: Member and Librarian (Role-Based Access Control)
* **Borrowing Limit**: Maximum **3 active books** borrowed per member at any time
* **Borrowing Duration**: Standard **7-day** loan period
* **Overdue Fine**: **10 Baht per day** per overdue book
* **Core Domain Entities**:
  * `Account`
  * `User`
  * `Member`
  * `Librarian`
  * `Book`
  * `BookCopy`
  * `Borrowing`
  * `Fine`
  * `FinePayment`
  * `Report`

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite 5, TypeScript, Lucide Icons, Vanilla CSS
* **Backend API**: Node.js, Express, TypeScript
* **Database**: SQLite3 (zero-configuration file-based relational DB)
* **Dev Tooling**: `concurrently`, `tsx`, `vite`

---

## 📁 Project Architecture & Structure

```
lib_management_system/
├── index.html              # Vite HTML entry
├── vite.config.ts          # Vite frontend configuration & API proxy
├── tsconfig.json           # TypeScript configuration
├── package.json            # Scripts & project dependencies
├── .env.example            # Environment configuration template
├── .gitignore              # Git file exclusions
├── README.md               # Project documentation
└── src/
    ├── main.tsx            # React application entry point
    ├── App.tsx             # Main App layout & route container
    ├── index.css           # Global theme variables & CSS resets
    ├── domain/             # Core OOAD Entity Classes
    ├── backend/
    │   ├── server.ts       # Express backend API server entry point
    │   ├── config/         # Environment & system parameters
    │   ├── controllers/    # API Request Handlers
    │   ├── services/       # OOAD Business Logic Services
    │   ├── repositories/   # Persistence Data Access Layer
    │   └── database/       # Database Connection & Migrations
    ├── frontend/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # View routes (Dashboard, Books, Members, etc.)
    │   ├── hooks/          # Custom React hooks
    │   └── styles/         # Styled CSS modules/utilities
    └── shared/
        └── types/          # Shared TypeScript DTOs & Interfaces
```

---

## ⚙️ Environment Variables Required

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Default variables:
* `PORT=5000`: Backend API server port
* `VITE_API_URL=http://localhost:5000/api`: Frontend API base URL
* `DATABASE_PATH=./data/library.db`: SQLite database location
* `MAX_BOOKS_PER_MEMBER=3`: Maximum books allowed per member
* `BORROW_PERIOD_DAYS=7`: Borrowing limit in days
* `FINE_RATE_PER_DAY_THB=10`: Daily fine rate in THB

---

## 🚀 How to Install & Run

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Environment

Starts both the Express backend API (`http://localhost:5000`) and the Vite React frontend (`http://localhost:3000`) concurrently:

```bash
npm run dev
```

### 3. Individual Run Commands

* **Frontend Only**: `npm run dev:client`
* **Backend Only**: `npm run dev:server`
* **Production Build Check**: `npm run build`

---

## 📊 Current Status & Roadmap

### Current Status: **Phase 12 Complete (Final Testing & Deployment Ready)**
All 12 implementation phases have been completed. All functional requirements (FR1–FR6), business rules (BR1–BR10), security standards, UI/UX polish, data integrity constraints, and automated verification suites have been verified with 100% test pass rate.

---

## 🔑 Demo Account Credentials

For university demonstration and testing:

| Role | Username / Student ID | Password | Purpose |
|---|---|---|---|
| **Librarian (Admin)** | `librarian_anan` | `LibrarianPass123!` | Book management, member management, issuing loans, processing returns, recording fine payments, generating reports |
| **Member (Student)** | `6712732101` | `MemberPass123!` | Active member with 1 overdue book & unpaid fine |
| **Member (Student)** | `6712732102` | `MemberPass123!` | Active member with 2 active loans |
| **Member (Student)** | `6712732103` | `MemberPass123!` | Active clean member |

---

## 🧪 Testing & Verification

Run the master automated test runner suite:

```bash
# Execute all 6 test modules in sequence
npm run test
```

Individual test suites can also be run:
- `npx tsx src/backend/tests/verify_auth.ts`
- `npx tsx src/backend/tests/verify_management.ts`
- `npx tsx src/backend/tests/verify_borrowing.ts`
- `npx tsx src/backend/tests/verify_fines.ts`
- `npx tsx src/backend/tests/verify_reports.ts`
- `npx tsx src/backend/tests/verify_phase10_e2e.ts`

---

## 🏗️ Production Build & Deployment Guide

### 1. Database Initialization & Seeding
```bash
npm run db:init
npm run db:seed
```

### 2. TypeScript & Production Bundle Build
```bash
npm run build
```

### 3. Production Execution
Start the Node/Express backend server:
```bash
node --import tsx src/backend/server.ts
```
Serve static production frontend files from `dist/` or preview:
```bash
npm run preview
```

