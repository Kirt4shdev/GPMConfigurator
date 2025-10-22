# Configurador de Estaciones Meteorológicas

Sistema completo de configuración de estaciones meteorológicas para **Grupo Dilus + GreenPowerMonitor**.

## 🎯 Características

- ✅ **Backend profesional**: Node.js + Express + TypeScript + PostgreSQL (sin ORM)
- ✅ **Frontend moderno**: React + Vite + TypeScript + Zustand + Tailwind CSS
- ✅ **Configurador interactivo**: SVG interactivo con hotspots
- ✅ **Cálculo en tiempo real**: Precios de equipos, cable por tramos, instalación
- ✅ **Gestión completa**: Proyectos, estaciones, sensores, POAs, opciones de cuadro
- ✅ **API REST documentada**: Swagger/OpenAPI incluido
- ✅ **Autenticación**: JWT con roles (usuario, admin)
- ✅ **Base de datos**: PostgreSQL con migraciones SQL + seed desde JSON

## 📦 Estructura del Proyecto

```
GPMConfigurator/
├── api/                    # Backend (Node + Express + TypeScript)
│   ├── src/
│   │   ├── config/        # Configuración (env, swagger)
│   │   ├── db/            # Pool, migraciones, seed
│   │   ├── middleware/    # Auth, validación, errores
│   │   └── modules/       # Módulos (auth, sensores, estaciones, etc.)
│   ├── package.json
│   └── tsconfig.json
│
├── web/                   # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/   # Componentes UI y configurador
│   │   ├── pages/        # Páginas (Login, Dashboard, Configurador)
│   │   ├── store/        # Zustand stores
│   │   ├── lib/          # Utilidades (API client, helpers)
│   │   └── assets/       # Assets locales (SVG)
│   ├── package.json
│   └── vite.config.ts
│
├── assets/               # Assets globales (logos, SVG)
├── seed/                 # Datos iniciales (JSON)
├── docs/                 # Documentación
├── docker-compose.yml    # PostgreSQL + Adminer
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 18.x
- **npm** o **yarn**
- **Docker** y **Docker Compose** (para PostgreSQL)
- **Git**

### 1️⃣ Clonar el Repositorio

```bash
git clone <repository-url>
cd GPMConfigurator
```

### 2️⃣ Configurar Variables de Entorno

#### Backend (API)

```bash
cd api
cp .env.example .env
```

Edita `api/.env` con tus configuraciones:

```env
NODE_ENV=development
PORT=3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=configurador
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Config
HQ_CITY=Madrid

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (Web)

```bash
cd ../web
cp .env.example .env
```

Edita `web/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3️⃣ Levantar Base de Datos (PostgreSQL)

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

Esto levantará:
- **PostgreSQL** en `localhost:5432`
- **Adminer** (GUI) en `http://localhost:8080`

Para verificar que PostgreSQL está corriendo:

```bash
docker-compose ps
```

### 4️⃣ Backend - Instalación y Configuración

```bash
cd api

# Instalar dependencias
npm install

# Ejecutar migraciones SQL
npm run migrate

# Importar seed (hotspots, sensores, opciones, usuarios demo)
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/openapi.json

#### Usuarios Demo Creados

Después del seed, tendrás estos usuarios:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@gpm.com` | `admin123` | Admin |
| `user@gpm.com` | `user123` | Usuario |

### 5️⃣ Frontend - Instalación y Ejecución

```bash
cd ../web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

## 📚 Uso del Sistema

### Login

1. Abre http://localhost:5173
2. Inicia sesión con:
   - **Admin**: `admin@gpm.com` / `admin123`
   - **Usuario**: `user@gpm.com` / `user123`

### Dashboard

- Ver todos tus proyectos
- Crear nuevo proyecto
- Abrir configurador de un proyecto

### Configurador

1. **Crear estación**: Botón "Nueva Estación" en el sidebar
2. **Configurar sensores**:
   - Haz clic en los hotspots (puntos interactivos) del SVG
   - Selecciona un sensor compatible
   - Los sensores se añaden automáticamente
3. **Añadir POAs**:
   - Tab "POAs" en el panel derecho
   - Crear nuevos POAs con distancia
   - Añadir sensores a cada POA
4. **Opciones de cuadro**:
   - Tab "Cuadro" en el panel derecho
   - Añadir datalogger, protecciones, etc.
5. **Ver resumen**:
   - Tab "Resumen" muestra el desglose completo
   - Equipos + Instalación + Transporte
   - Cálculo automático según provincia

## 🔌 API Endpoints

### Autenticación

```
POST   /api/auth/login       # Login
POST   /api/auth/refresh     # Refresh token
GET    /api/auth/me          # Usuario actual
```

### Proyectos

```
GET    /api/proyectos        # Listar proyectos
GET    /api/proyectos/:id    # Obtener proyecto
POST   /api/proyectos        # Crear proyecto
PUT    /api/proyectos/:id    # Actualizar proyecto
DELETE /api/proyectos/:id    # Eliminar proyecto
```

### Estaciones

```
GET    /api/estaciones?project_id=...  # Listar estaciones
GET    /api/estaciones/:id             # Obtener estación
POST   /api/estaciones                 # Crear estación
PUT    /api/estaciones/:id             # Actualizar estación
DELETE /api/estaciones/:id             # Eliminar estación

PUT    /api/estaciones/:id/hotspot-map           # Actualizar mapa hotspots
POST   /api/estaciones/:id/selecciones           # Añadir sensor
DELETE /api/estaciones/:id/selecciones/:selId    # Eliminar sensor
POST   /api/estaciones/:id/panel-options         # Añadir opción cuadro
DELETE /api/estaciones/:id/panel-options/:optId  # Eliminar opción
```

### POAs

```
GET    /api/poas?station_id=...     # Listar POAs
GET    /api/poas/:id                # Obtener POA
POST   /api/poas                    # Crear POA
PUT    /api/poas/:id                # Actualizar POA
DELETE /api/poas/:id                # Eliminar POA

POST   /api/poas/:id/sensores       # Añadir sensor a POA
DELETE /api/poas/:id/sensores/:sId  # Eliminar sensor de POA
```

### Catálogo (Admin)

```
GET    /api/hotspots               # Listar hotspots
GET    /api/sensores               # Listar sensores
GET    /api/opciones-cuadro        # Listar opciones cuadro
```

### Helpers

```
GET    /api/precios/cable?sensor_id=...&metros=...            # Calcular precio cable
GET    /api/instalacion/estimacion?provincia=...&num_estaciones=...  # Estimar instalación
GET    /api/instalacion/config                                # Config instalación
PUT    /api/instalacion/config                                # Actualizar config (admin)
```

## 🧮 Lógica de Cálculo

### Cable por Tramos

Los sensores tienen precios de cable por tramos (ej: 0-10m, 10-20m, 20-50m, 50-100m). El sistema suma los precios de todos los tramos que cubre el metraje configurado.

Ejemplo para 35 metros:
- Tramo 0-10m: 0€
- Tramo 10-20m: 35€
- Tramo 20-50m: 75€ (solo hasta 35m)
- **Total cable**: 110€

### Instalación "Viaje-Contar"

El cálculo de días de instalación sigue la regla:

```
Días totales = Días ida + Días instalación + Días vuelta

- Días ida: 0.5 días si distancia ≤ umbral_ida_km, sino 1 día
- Días instalación: 1 día por estación
- Días vuelta: 0.5 días si distancia ≤ umbral_vuelta_km, sino 1 día

Costo mano obra = Días totales × Tarifa diaria
Costo transporte = Distancia km × 2 (ida+vuelta) × €/km
```

## 🛠️ Desarrollo

### Scripts Backend

```bash
npm run dev      # Desarrollo (watch mode)
npm run build    # Compilar TypeScript
npm run start    # Producción
npm run migrate  # Ejecutar migraciones
npm run seed     # Importar seed
```

### Scripts Frontend

```bash
npm run dev      # Desarrollo (Vite)
npm run build    # Build producción
npm run preview  # Preview build
```

### Base de Datos

**Adminer** (GUI PostgreSQL): http://localhost:8080

- **Sistema**: PostgreSQL
- **Servidor**: postgres (o localhost desde fuera de Docker)
- **Usuario**: postgres
- **Contraseña**: postgres
- **Base de datos**: configurador

## 🎨 Diseño y UX

- **Estilo**: Elegante, profesional, tipo configurador de coches
- **Colores**: Paleta corporativa Grupo Dilus + GPM
- **Transiciones**: Suaves, micro-animaciones
- **Responsive**: Optimizado para desktop
- **Accesibilidad**: Roles ARIA, teclado-friendly

## 📄 Tecnologías

### Backend

- Node.js + Express
- TypeScript
- PostgreSQL (pg library, sin ORM)
- JWT (jsonwebtoken)
- Zod (validación)
- Swagger + OpenAPI
- Bcrypt (passwords)
- Helmet, CORS, Rate limiting

### Frontend

- React 18
- Vite
- TypeScript
- Zustand (estado global)
- React Router
- Tailwind CSS
- Lucide React (iconos)
- SVG interactivo

### Infraestructura

- Docker Compose (solo PostgreSQL)
- PostgreSQL 16
- Adminer

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT para autenticación
- ✅ RBAC (Role-Based Access Control)
- ✅ Rate limiting en API
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de entrada (Zod)
- ✅ SQL preparado (previene SQL injection)

## 📝 Notas Importantes

- ❌ **Sin Prisma ni ORM**: Se usa directamente `pg` (PostgreSQL driver)
- ❌ **Sin Docker para backend/frontend**: Solo para PostgreSQL
- ✅ **Sin mocks**: Todo el frontend consume la API real
- ✅ **Seed desde JSON**: Importa `seed/seed_sensores_opciones.json`
- ✅ **SVG local**: El esquema está en `assets/` y se copia al build

## 🐛 Troubleshooting

### PostgreSQL no conecta

```bash
# Verificar que Docker está corriendo
docker-compose ps

# Reiniciar contenedores
docker-compose down
docker-compose up -d

# Ver logs
docker-compose logs postgres
```

### Backend no arranca

```bash
# Verificar variables de entorno
cat api/.env

# Reinstalar dependencias
cd api
rm -rf node_modules package-lock.json
npm install

# Verificar que migraciones se ejecutaron
npm run migrate
```

### Frontend no conecta con API

1. Verifica que el backend está corriendo en http://localhost:3000
2. Revisa `web/.env` → `VITE_API_URL=http://localhost:3000/api`
3. Reinicia el frontend: `npm run dev`

### Error de CORS

Verifica en `api/.env` que:
```
CORS_ORIGIN=http://localhost:5173
```

## 📞 Contacto y Soporte

Para consultas sobre este proyecto, contacta al equipo de desarrollo de Grupo Dilus + GreenPowerMonitor.

---

**🚀 ¡Listo para configurar estaciones meteorológicas de forma profesional!**

