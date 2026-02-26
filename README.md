# 🚀 Task Manager Pro - Full-Stack Technical Test

This is a full-stack task management application built to demonstrate good architecture, security, and modern design practices.

## 🛠️ Technology Stack
* **Backend:** Node.js, Fastify, TypeScript, Kysely (Query Builder), PostgreSQL, JWT, Bcrypt.
* **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui.
* **Infrastructure:** Docker & Docker Compose.

## ⚙️ Prerequisites
* Node.js (v18 or higher)
* Docker and Docker Desktop running on your machine.

## 🚀 Quick Start Guide

### 1. Start the Database
From the project root, start the PostgreSQL container:
\`\`\`bash
docker compose up -d
\`\`\`

### 2. Set Up and Start the Backend
\`\`\`bash
cd backend
npm install
\`\`\`
* Create a `.env` file based on `.env.example`.
* Run the migrations to create the tables:
\`\`\`bash
npm run migrate
\`\`\`
* Start the development server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Set Up and Start the Frontend (in another terminal)
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 🌟 Key Features (Bonus Points completed)
* Secure authentication with JWT and password hashing.
* **Role System:** Supports 'ADMIN' and 'USER' roles in the database.
* **DB Pagination:** Tasks endpoint supports native SQL limit/offset (`?page=1&limit=10`).
* **Modern UI:** Accessible, responsive interface using `shadcn/ui` and Tailwind CSS.

## 📖 API Documentation

All requests to task routes (`/api/tasks`) require a valid JWT in the headers:
`Authorization: Bearer <your_token>`

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Body (JSON) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Register a new user | `{ "email": "x@x.com", "password": "123", "role": "USER" }` |
| **POST** | `/api/auth/login` | Log in and receive a JWT | `{ "email": "x@x.com", "password": "123" }` |

### 📋 Tasks (`/api/tasks`)

| Method | Endpoint | Description | Query Params / Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | Get the logged-in user’s task list | **Query:** `?page=1&limit=5&status=PENDING` (optional) |
| **POST** | `/api/tasks` | Create a new task | **Body:** `{ "title": "Study React", "description": "..." }` |
| **PATCH** | `/api/tasks/:id` | Update a task’s status | **Body:** `{ "status": "COMPLETED" }` |
| **DELETE**| `/api/tasks/:id` | Delete a task by ID | *None* |