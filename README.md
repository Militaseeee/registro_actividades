# registro_actividades

API RESTful para gestionar usuarios, categorías de actividad, actividades y registros diarios de un sistema de seguimiento de bienestar.
Construida con Node.js, Express y PostgreSQL. Incluye creación automática del esquema y colección de Postman para probar rápidamente.

---

## 🚀 Características
- CRUD completo de usuarios (nombre, correo, rol) con endpoints para listar, contar, crear, actualizar y eliminar.
- Autenticación segura:
	- Registro de usuarios con hash de contraseña usando bcrypt.
	- Login con verificación de hash y retorno de datos básicos (incluyendo rol).
- Gestión de actividades:
	- CRUD de actividades registradas por usuario (con unión a categorías y detalles).
	- Filtrado de actividades por usuario.
	- Actualización y eliminación de registros de actividad.
- Consultas enriquecidas con JOIN a múltiples tablas para obtener información completa.
- Gestión de actividades disponibles (desde la tabla Actividad).
- Registro de actividad diaria (fecha, duración, descripción).
- Carga masiva de usuarios desde archivo CSV usando multer + csv-parser.
- Conexión a PostgreSQL usando pg con soporte para SSL (ej. Supabase).
- Soporte CORS para conexión desde frontend.
- Variables de entorno manejadas con dotenv.

---

## 📁 Estructura del Proyecto
```
registro_actividades/
├── assets/
│   ├── icons                  
│   └── img                    
├── css/
│   ├── about.css              
│   ├── activities.css                    
│   ├── add_activity.css
│   ├── admin_activities.css
│   ├── home.css
│   ├── style.css
│   ├── upload.css
│   └── users.css
├── js/
│   ├── activitiesTable.js              
│   ├── addUser.js                   
│   ├── adminActivities.js
│   ├── form.js
│   ├── hash.js
│   ├── modal.js
│   ├── navigate.js
│   ├── script.js
│   ├── modal.js
│   ├── services.js
│   ├── upload.js
│   └── users.css
├── views/
│   ├── about.html   
│   ├── activities.html          
│   ├── add_activity.html                 
│   ├── add_user.html
│   ├── admin_activities.html
│   ├── dashboard.html
│   ├── explore.html
│   ├── historial.html
│   ├── home.html
│   ├── login.html
│   ├── register.html
│   ├── upload_user.html
│   └── users.html
├── .env                       
├── .gitignore
├── index.html     
├── install.md  
├── package-lock.json
├── package.json
├── scriptpg.js
└── README.md
```

---

## 🧰 Requisitos previos
- Node.js 18+ y npm
- MySQL 8.x en ejecución (local o remoto)

---

## 🔧 Configuración e Instalación

1) Clona el repositorio
```powershell
git clone https://github.com/Militaseeee/registro_actividades.git
cd registro_actividades
```

2) Dependencias principales y su propósito
```js
import express, { json } from 'express';
import pkg from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
```

- express → Framework para crear el servidor y manejar rutas HTTP.
- pg → Cliente para conectarse a PostgreSQL.
- cors → Permite que otros dominios (como tu frontend) hagan peticiones a este servidor.
- bcrypt → Encriptación y comparación de contraseñas.
- dotenv → Carga variables de entorno desde un archivo .env.
- multer → Manejo de archivos subidos por el cliente (ej. CSV).
- csv-parser → Lectura y conversión de archivos CSV a objetos JavaScript.
- fs → Módulo de Node.js para manejo de archivos.


3) Crea la base de datos en MySQL (ajusta puerto/usuario si aplica)
   En Supabase, la base de datos ya viene creada por defecto, pero puedes crear el esquema y tablas necesarias desde la sección SQL.
   
Ejemplo para crear el esquema:
```sql
CREATE SCHEMA IF NOT EXISTS registro_actividades;
```

4) Crea tu archivo `.env`

Este proyecto incluye `/.env` en `.gitignore`, por lo que no se sube a GitHub. Debes crearlo localmente con el siguiente contenido. Importante: no uses comillas en los valores (por ejemplo, DB_NAME=postgres).

```
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_USER=postgres.dgzuhlfrgxxdjipbcbcu
DB_PASSWORD= *****
DB_NAME=postgres
DB_PORT=6543
```

Nota: si tu MySQL escucha en el puerto por defecto, usa `DB_PORT=6543`.

5) Inicia el servidor (creará tablas automáticamente si no existen)
```powershell
npm start
```

Servidor disponible por defecto en: http://localhost:3000

---

## 🧪 Pruebas con Postman
- Importa `registro_actividades API.postman_collection.json` en Postman.
- La variable `baseURL` ya apunta a `http://localhost:3000`.
- Incluye ejemplos para crear/consultar usuarios y actividades, además de consultas avanzadas.

---

## 🧷 Modelos de Datos (Esquema)

- usuario
	- id_usuario (PK, SERIAL)
	- nombre (VARCHAR, NOT NULL)
	- correo (VARCHAR, UNIQUE, NOT NULL)
	- rol (VARCHAR, DEFAULT 'user')

- credenciales
	- id_usuario (PK, FK → usuario.id_usuario)
	- hash_contrasena (TEXT, NOT NULL)

- categoriaactividad
	- id_categoria (PK, SERIAL)
	- nombre (VARCHAR, UNIQUE, NOT NULL)

- actividad
	- id_actividad (PK, SERIAL)
	- nombre (VARCHAR, NOT NULL)
	- id_categoria (FK → categoriaactividad.id_categoria, NOT NULL)

- registrodiario
	- id_registro (PK, SERIAL)
	- id_usuario (FK → usuario.id_usuario, NOT NULL)
	- id_actividad (FK → actividad.id_actividad, NOT NULL)
	- fecha (DATE, NOT NULL)
	- duracion_min (INT)
	- descripcion (TEXT)

---

## 📡 Endpoints Principales

Base URL: `http://localhost:3000`

### Usuarios
- **GET** `/usuarios` — Listar todos los usuarios.
- **GET** `/usuarios/count` — Contar usuarios.
- **POST** `/usuarios` — Crear usuario.  
  **Body JSON:**
  ```json
  {
    "nombre": "Juan Pérez",
    "correo": "juan@email.com",
    "rol": "user"
  }
  ```
- **PUT** `/usuarios/:id` — Actualizar un usuario.
- **DELETE** `/usuarios/:id` — Eliminar un usuario.

### Autenticación
- **POST** `/registro` — Registrar usuario con hash de contraseña.
  **Body JSON:** 
  ```json
  {
    "nombre": "Juan",
    "correo": "juan@email.com",
    "password": "1234"
  }
  ```
- **POST** `/login` — Iniciar sesión.
  **Body JSON:** 
  ```json
  {
    "correo": "admin@bienestar.io",
    "contrasena": "1234"
  }
  ```

### Actividades y Registros Diarios
- **GET** `/actividades` — Lista todos los registros diarios (JOIN de usuario, actividad y categoría).
- **GET** `/actividades/usuario/:id_usuario` — Lista registros de un usuario específico.
- **PUT** `/registro-actividad/:id_registro` — Actualizar un registro diario usando nombre de actividad.
  **Body JSON:** 
  ```json
  {
    "nombre_actividad": "Correr",
    "fecha": "2025-08-10",
    "duracion_min": 30,
    "descripcion": "Corrió en el parque"
  }
  ```
- **POST** `/registro-actividad` — Registrar nueva actividad de un usuario usando nombre de actividad.
  **Body JSON:** 
  ```json
  {
    "id_usuario": 1,
    "nombre_actividad": "Correr",
    "fecha": "2025-08-10",
    "duracion_min": 30,
    "descripcion": "Corrió en el parque"
  }
  ```
- **DELETE** `/eliminar-actividad/:id_registro` — Eliminar un registro diario.

### Actividades Disponibles
- **GET** `/actividades-disponibles` — Lista todas las actividades de la tabla `actividad`.

### Carga Masiva desde CSV
- **POST** `/upload-usuarios-csv` — Carga usuarios desde un archivo CSV.
  **Tipo de envío:** `multipart/form-data` 
  **Campo de archivo:** `csvFile`

### Ejemplo de CSV válido
```csv
nombre,correo,rol
Juan Pérez,juan@example.com,user
Ana Torres,ana@example.com,admin
Luis Gómez,luis@example.com,user
```

---

## ⚡ Prueba Rápida (cURL en Windows)

Crear una sala:
```powershell
curl -X POST "http://localhost:3000/salas" ^
	-H "Content-Type: application/json" ^
	-d "{\"nombre\":\"Sala Test\",\"capacidad\":5,\"responsable\":\"Test\"}"
```

Listar reservas con detalles:
```powershell
curl "http://localhost:3000/reservas"
```

Buscar por empleado:
```powershell
curl "http://localhost:3000/reservas/buscar-empleado?valor=juan"
```

---

## 🧩 Tecnologías

- **Node.js** + **Express** — Servidor backend y gestión de rutas HTTP.
- **PostgreSQL** (`pg`) — Base de datos relacional.
- **dotenv** — Manejo de variables de entorno.
- **CORS** — Permitir solicitudes desde otros dominios.
- **bcrypt** — Hash y verificación segura de contraseñas.
- **multer** — Subida de archivos (CSV).
- **csv-parser** — Lectura y parseo de archivos CSV.
- **fs** (Node.js File System) — Manejo de archivos en el servidor.


---

## 🛠️ Scripts npm
- `npm start` — Inicia el servidor Express (crea tablas si no existen).

---

## ❓ Troubleshooting
- Error de conexión MySQL:
	- Verifica las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` en tu `.env`.
	- Asegúrate de que el servicio PostgreSQL esté activo y el puerto sea accesible (por defecto 6543).
    - Si usas Supabase o un servidor remoto, revisa que SSL esté habilitado (ssl: { rejectUnauthorized: false }).
	- Crea la base manualmente si no existe.

---
