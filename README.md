# 🚀 Task Manager Pro - Prueba Técnica Full-Stack

Esta es una aplicación de gestión de tareas Full-Stack construida para demostrar buenas prácticas de arquitectura, seguridad y diseño moderno.

## 🛠️ Stack Tecnológico
* **Backend:** Node.js, Fastify, TypeScript, Kysely (Query Builder), PostgreSQL, JWT, Bcrypt.
* **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui.
* **Infraestructura:** Docker & Docker Compose.

## ⚙️ Requisitos Previos
* Node.js (v18 o superior)
* Docker y Docker Desktop corriendo en tu máquina.

## 🚀 Guía de Inicio Rápido

### 1. Levantar la Base de Datos
Desde la raíz del proyecto, enciende el contenedor de PostgreSQL:
\`\`\`bash
docker compose up -d
\`\`\`

### 2. Configurar y Encender el Backend
\`\`\`bash
cd backend
npm install
\`\`\`
* Crea un archivo `.env` basado en el `.env.example`.
* Ejecuta las migraciones para crear las tablas:
\`\`\`bash
npm run migrate
\`\`\`
* Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

### 3. Configurar y Encender el Frontend (En otra terminal)
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 🌟 Características Principales (Bonus Points completados)
* Autenticación segura con JWT y encriptación de contraseñas.
* **Sistema de Roles:** Soporte para usuarios 'ADMIN' y 'USER' en la base de datos.
* **Paginación en BD:** El endpoint de tareas soporta límite y desplazamiento nativo en SQL (`?page=1&limit=10`).
* **UI Moderna:** Interfaz accesible y responsiva usando `shadcn/ui` y Tailwind CSS.