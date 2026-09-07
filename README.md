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

### Current Status: **Phase 1 Complete (Project Analysis & Architecture Setup)**
Project structure, configuration, TypeScript setup, and architectural placeholders established. No business logic or DB schema initialized.

### Planned Implementation Phases

1. **Phase 1: Project Analysis & Setup** *(Completed)*
2. **Phase 2: Database & Data Model**
3. **Phase 3: Backend & API Foundation**
4. **Phase 4: Frontend Foundation**
5. **Phase 5: Authentication & Access Control**
6. **Phase 6: Book & Member Management**
7. **Phase 7: Borrowing & Returning Workflow**
8. **Phase 8: Fine Calculation & Payment Management**
9. **Phase 9: Reports & Analytics Dashboard**
10. **Phase 10: Integration & Validation**
11. **Phase 11: UI/UX Polish & Final Demo Preparation**
