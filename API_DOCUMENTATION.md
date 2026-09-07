# Library Management System - REST API Documentation

**Base URL**: `http://localhost:5000/api`

## Authentication

All protected endpoints require an HTTP `Authorization` header containing a JSON Web Token (JWT):
```http
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Registers a new Member. Username is automatically set to Student ID.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "Prasert Kaewmanee",
    "studentId": "6712732109",
    "faculty": "Engineering",
    "major": "Computer Engineering",
    "password": "Password123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "user": { "studentId": "6712732109", "name": "Prasert Kaewmanee", "role": "MEMBER" },
    "token": "eyJhbGciOi..."
  }
  ```

### `POST /api/auth/login`
Authenticates a Member or Librarian.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "username": "6712732101",
    "password": "pbkdf2_hash_placeholder_456"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "username": "6712732101", "role": "MEMBER", "memberId": 1 }
  }
  ```

### `GET /api/auth/me`
Retrieves authenticated token user details.
* **Access**: Authenticated

---

## 2. Book & BookCopy Endpoints (`/api/books`)

### `GET /api/books`
Lists all books with available physical copy counts.
* **Access**: Public
* **Query Params**: `search` (optional search by title, author, ISBN, or ID)

### `GET /api/books/:id`
Gets book details by ID including list of physical BookCopies.
* **Access**: Public

### `POST /api/books`
Creates a new catalog book and auto-generates physical `BookCopy` entries.
* **Access**: Librarian Only
* **Request Body**:
  ```json
  {
    "isbn": "978-0132350884",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "publisher": "Prentice Hall",
    "publicationYear": 2008,
    "quantity": 2
  }
  ```

### `PUT /api/books/:id`
Updates existing book information.
* **Access**: Librarian Only

### `DELETE /api/books/:id`
Deletes a book catalog entry.
* **Access**: Librarian Only

### `POST /api/books/:id/copies`
Adds a new physical `BookCopy` to a book.
* **Access**: Librarian Only

### `PUT /api/books/copies/:copyId/status`
Updates status of physical BookCopy (`AVAILABLE` | `BORROWED` | `LOST`).
* **Access**: Librarian Only

---

## 3. Member Endpoints (`/api/members`)

### `GET /api/members`
Lists all library members.
* **Access**: Librarian Only

### `GET /api/members/:id`
Gets member details.
* **Access**: Member (self) or Librarian

### `PUT /api/members/:id`
Updates member profile.
* **Access**: Member (self) or Librarian

### `PUT /api/members/:id/status`
Activates or deactivates member account (`ACTIVE` | `SUSPENDED`).
* **Access**: Librarian Only

### `GET /api/members/:id/borrowings`
Gets member borrowing history.
* **Access**: Member (self) or Librarian

---

## 4. Borrowing & Returning Endpoints (`/api/borrowings`)

### `POST /api/borrowings`
Creates a new borrowing transaction (7-day due date).
* **Access**: Authenticated Member / Librarian
* **Validations**: Member ACTIVE status, < 3 active borrowed books limit, no overdue books, no unpaid fines, BookCopy `AVAILABLE`.
* **Request Body**:
  ```json
  {
    "memberId": 1,
    "copyId": "BC-1001-01"
  }
  ```

### `POST /api/borrowings/:id/return`
Processes book return. Calculates overdue days and auto-generates 10 THB/day fine if overdue.
* **Access**: Librarian Only

---

## 5. Fine & FinePayment Endpoints (`/api/fines`)

### `GET /api/fines`
Lists fines.
* **Access**: Member (own fines) or Librarian (all fines)
* **Query Params**: `status` (`UNPAID` | `PAID`), `memberId`

### `POST /api/fines/:id/pay`
Records fine payment transaction and changes status from `UNPAID` to `PAID`.
* **Access**: Librarian Only

### `GET /api/fines/payments`
Lists fine payment history records.
* **Access**: Librarian Only

---

## 6. Report Endpoints (`/api/reports`)

* `GET /api/reports/current-borrowings`: Current active borrowings.
* `GET /api/reports/overdue`: Overdue transactions.
* `GET /api/reports/unpaid-fines`: Members with unpaid fines.
* `GET /api/reports/transactions`: Transaction history report (filters: `startDate`, `endDate`, `memberId`, `bookId`).
* **Access**: Librarian Only for all report endpoints.
