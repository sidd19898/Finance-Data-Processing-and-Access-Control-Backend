# 💰 Finance Data Processing & Access Control Backend

## 📌 Overview

This project is a **Node.js + Express backend system** for managing financial records with **JWT authentication, role-based access control (RBAC), and dashboard analytics**.

It allows:

* Secure user authentication
* Role-based permissions (Viewer, Analyst, Admin)
* Financial record management
* Filtering and querying
* Aggregated dashboard insights

---

## 🚀 Features

### 🔐 Authentication

* User Signup (`/signup`)
* User Signin (`/signin`)
* JWT-based authentication

---

### 🛡️ Security

* **Helmet** for HTTP security
* **Rate limiting** (100 requests / 15 min)
* JSON body size limit (`10kb`)

---

### 👥 Role-Based Access Control

| Role    | Permissions                          |
| ------- | ------------------------------------ |
| Viewer  | View records                         |
| Analyst | View records + dashboard             |
| Admin   | Full access (CRUD + user management) |

---

### 👤 User Management (Admin Only)

* Create user
* Update user role
* Delete user
* View all users

---

### 💰 Financial Records

Fields:

* `Amount` (Number)
* `Type` (income / expense)
* `Category`
* `Date` (auto-generated if not provided)
* `Description`

---

### 📊 Dashboard Analytics

Provides:

* Total Income
* Total Expenses
* Net Balance
* Category-wise totals
* Recent activity
* Monthly trends
* Weekly trends

---

## 🔍 Filtering API

### Endpoint:

```http
GET /records
```

### Query Parameters:

* `Type` → income / expense
* `Category` → e.g., food, rent
* `startDate` → YYYY-MM-DD
* `endDate` → YYYY-MM-DD

---

### Example:

```http
GET /records?Type=expense&Category=food&startDate=2026-01-01&endDate=2026-03-01
```

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB + Mongoose**
* **JWT (Authentication)**
* **Zod (Validation)**
* **Helmet (Security)**
* **Express Rate Limit**

---

## 📂 Project Structure

```bash
├── config/
│   └── db.js
├── middleware/
│   ├── authentication.js
│   └── authorize.js
├── model/
│   ├── user.js
│   └── records.js
├── routes/
│   ├── auth.js
│   └── admin.js
├── index.js
└── package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone repo

```bash
git clone <repo-url>
cd project-folder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

```env
PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

### 4. Run server

```bash
node index.js
```

---

## 🔑 API Endpoints

### 🔐 Auth

* `POST /signup`
* `POST /signin`

---

### 👤 Users (Admin)

* `GET /read/user`
* `POST /create/user`
* `PUT /update/user/:id`
* `DELETE /delete/user/:id`

---

### 💰 Records

* `GET /records` → all roles
* `POST /create/records` → admin
* `PUT /update/records/:id` → admin
* `DELETE /delete/records/:id` → admin

---

### 📊 Dashboard

* `GET /dashboard/summary` → analyst, admin

---

## 🧪 Testing

Use **Postman**

### Add Header:

```http
Authorization: Bearer <your_token>
```

---

## ⚠️ Important Notes

* MongoDB is **case-sensitive**

  * Use: `Amount`, `Type`, `Category`, `Date`
* Date must be stored as **Date type (ISODate)** for aggregation
* Insert records via API to ensure proper type conversion

---

## 📌 Example Record

```json
{
  "amount": 100,
  "type": "expense",
  "category": "food",
  "description": "Lunch"
}
```

---

## ⚠️ Known Limitations

* Passwords are stored in plain text (should use hashing like bcrypt in production)
* No pagination for records
* No refresh token system

---

## 🎯 Key Concepts Demonstrated

* REST API Design
* JWT Authentication
* Role-Based Access Control (RBAC)
* MongoDB Aggregation Pipeline
* Input Validation (Zod)
* Backend Security Practices

---

## 👨‍💻 Author

**Siddhant Angane**

---

## ⭐ Conclusion

This project demonstrates a **complete backend system** with authentication, authorization, data processing, and analytics. It is structured for scalability and real-world backend applications.
