# Arquitectura del Sistema

## Visión General

Sistema de configuración de estaciones meteorológicas con arquitectura **separada backend-frontend**:

- **Backend**: API REST en Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: SPA en React + Vite + TypeScript
- **Base de datos**: PostgreSQL (solo en Docker)

## Diagramas

### Arquitectura General

```
┌─────────────────┐
│   React SPA     │ ← Usuario (Browser)
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP/JSON
         ↓
┌─────────────────┐
│   Express API   │
│  (Port 3000)    │
│   + Swagger     │
└────────┬────────┘
         │ pg (driver)
         ↓
┌─────────────────┐
│  PostgreSQL DB  │
│  (Port 5432)    │ ← Docker
└─────────────────┘
```

### Flujo de Datos (Ejemplo: Configurar Sensor)

```
1. Usuario click hotspot SVG
   ↓
2. React → POST /api/estaciones/:id/selecciones
   ↓
3. Express valida JWT + datos (Zod)
   ↓
4. pool.query("INSERT INTO station_selections...")
   ↓
5. PostgreSQL → confirma inserción
   ↓
6. Express → JSON response
   ↓
7. React actualiza UI
```

## Backend (API)

### Stack Tecnológico

| Componente | Tecnología | Propósito |
|------------|-----------|-----------|
| Runtime | Node.js 18+ | Servidor JavaScript |
| Framework | Express 4 | API REST |
| Language | TypeScript | Type safety |
| Database | PostgreSQL 16 | Persistencia |
| DB Client | `pg` (driver nativo) | Sin ORM |
| Auth | JWT (jsonwebtoken) | Autenticación stateless |
| Validation | Zod | Esquemas de validación |
| Docs | Swagger + OpenAPI | Documentación interactiva |
| Security | Helmet, CORS, Rate Limiting | Protección |

### Estructura de Carpetas

```
api/
├── src/
│   ├── config/
│   │   ├── env.ts              # Variables de entorno
│   │   └── swagger.ts          # Config Swagger
│   │
│   ├── db/
│   │   ├── pool.ts             # Pool de conexiones pg
│   │   ├── migrate.ts          # Script migraciones
│   │   ├── seed.ts             # Script seed
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   │
│   ├── middleware/
│   │   ├── auth.ts             # JWT + RBAC
│   │   ├── errorHandler.ts    # Manejo de errores
│   │   └── validate.ts         # Validación Zod
│   │
│   ├── modules/                # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   ├── sensores/
│   │   ├── hotspots/
│   │   ├── opciones/
│   │   ├── proyectos/
│   │   ├── estaciones/
│   │   ├── poas/
│   │   └── helpers/
│   │       ├── helpers.controller.ts  # Cálculos
│   │       └── helpers.routes.ts
│   │
│   ├── app.ts                  # Express app config
│   └── server.ts               # Entry point
│
├── package.json
├── tsconfig.json
└── .env.example
```

### Módulos Principales

#### 1. Auth (`modules/auth/`)
- Login con email/password
- JWT generation + refresh
- Middleware de autenticación
- RBAC (usuario, admin)

#### 2. Proyectos (`modules/proyectos/`)
- CRUD proyectos
- Filtro por usuario (no admin)

#### 3. Estaciones (`modules/estaciones/`)
- CRUD estaciones
- Gestión selecciones de sensores (1 por hotspot)
- Opciones de cuadro eléctrico
- Hotspot map (snapshot JSON)

#### 4. POAs (`modules/poas/`)
- CRUD POAs
- Sensores por POA (múltiples)
- Distancia a estación

#### 5. Sensores (`modules/sensores/`)
- Catálogo de sensores
- Filtros: tipo, montaje_permitido
- Admin CRUD

#### 6. Hotspots (`modules/hotspots/`)
- Catálogo de hotspots (coords SVG)
- Admin CRUD

#### 7. Opciones (`modules/opciones/`)
- Catálogo opciones cuadro
- Admin CRUD

#### 8. Helpers (`modules/helpers/`)
- **Cálculo cable por tramos**: suma precios según metros
- **Estimación instalación**: días (viaje-contar) + costos

### Modelo de Datos (PostgreSQL)

```sql
users
  id, email, password_hash, name, role

projects
  id, name, description, client_*, user_id

stations
  id, project_id, name, provincia, latitud, longitud, hotspot_map_json

station_selections
  id, station_id, sensor_id, hotspot_key, metros_cable
  UNIQUE(station_id, hotspot_key)  ← 1 sensor por hotspot

poas
  id, station_id, nombre, distancia_a_estacion_m

poa_sensors
  id, poa_id, sensor_id, metros_cable

sensors
  id, brand, model, type, montaje_permitido, precio_base,
  allowed_hotspots_json, cable_pricing_json, docs_json, images_json

panel_options
  id, nombre, tipo, precio, attrs_json

station_panel_options
  id, station_id, panel_option_id, quantity
  UNIQUE(station_id, panel_option_id)

hotspots
  key, x, y, label

installation_config
  id, hq_city, tarifa_diaria, transporte_euros_km, umbrales...
```

### Lógica de Negocio Clave

#### Cable por Tramos

```typescript
// Ejemplo: sensor con tramos 0-10, 10-20, 20-50, 50-100
// Usuario configura 35 metros
// → Tramos aplicados: 10-20 (35€) + 20-50 (75€ parcial) = 110€

const calculateCablePrice = (tiers, metros) => {
  let total = 0;
  for (tier of sortedTiers) {
    if (metros > tier.min_m) {
      const metersInTier = Math.min(metros, tier.max_m) - tier.min_m;
      if (metersInTier > 0) total += tier.precio;
    }
  }
  return total;
};
```

#### Instalación "Viaje-Contar"

```typescript
// Regla: ida + instalación + vuelta
// - Ida: 0.5 días si distancia ≤ umbral_ida_km, sino 1 día
// - Instalación: 1 día por estación
// - Vuelta: 0.5 días si distancia ≤ umbral_vuelta_km, sino 1 día

const estimateInstallation = (provincia, numEstaciones) => {
  const distanciaKm = getDistanceBetween(hqCity, provincia);
  
  const diasIda = distanciaKm <= umbralIdaKm ? 0.5 : 1;
  const diasVuelta = distanciaKm <= umbralVueltaKm ? 0.5 : 1;
  const diasInstalacion = numEstaciones;
  
  const diasTotales = diasIda + diasInstalacion + diasVuelta;
  
  const costoManoObra = diasTotales * tarifaDiaria;
  const costoTransporte = distanciaKm * 2 * eurosKm; // ida+vuelta
  
  return { costoManoObra, costoTransporte };
};
```

## Frontend (Web)

### Stack Tecnológico

| Componente | Tecnología | Propósito |
|------------|-----------|-----------|
| Framework | React 18 | UI components |
| Build Tool | Vite | Dev server + build |
| Language | TypeScript | Type safety |
| State | Zustand | Estado global |
| Routing | React Router 6 | SPA routing |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | Custom (shadcn/ui style) | Componentes reutilizables |
| Icons | Lucide React | Iconos |
| HTTP | Fetch API | Cliente API |

### Estructura de Carpetas

```
web/
├── public/
│   └── assets/                 # Assets estáticos
│       ├── infografia_Renovables_centered.svg
│       ├── lockup_dilus_gpm_horizontal.png
│       └── lockup_dilus_gpm_stacked.png
│
├── src/
│   ├── assets/                 # Assets importables
│   │   └── infografia_Renovables_centered.svg
│   │
│   ├── components/
│   │   ├── ui/                 # Componentes UI básicos
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   └── Tabs.tsx
│   │   │
│   │   └── configurador/       # Componentes específicos
│   │       ├── Topbar.tsx
│   │       ├── Sidebar.tsx
│   │       ├── SVGViewer.tsx   # ⭐ SVG interactivo
│   │       ├── RightPanel.tsx
│   │       └── tabs/
│   │           ├── StationTab.tsx
│   │           ├── POAsTab.tsx
│   │           ├── PanelTab.tsx
│   │           └── SummaryTab.tsx
│   │
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── Configurador.tsx    # ⭐ Página principal
│   │
│   ├── store/
│   │   ├── useAuthStore.ts     # Auth state (Zustand)
│   │   └── useConfiguratorStore.ts
│   │
│   ├── lib/
│   │   ├── api.ts              # ⭐ Cliente API (fetch wrapper)
│   │   └── cn.ts               # Utility (classnames)
│   │
│   ├── App.tsx                 # Router + auth guard
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind + custom styles
│
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Componentes Clave

#### 1. SVGViewer (Interactivo)

```tsx
// web/src/components/configurador/SVGViewer.tsx

- Renderiza SVG de la estación
- Hotspots posicionados con coords absolutas
- Click hotspot → modal selector de sensores
- Filtrado: solo sensores compatibles con hotspot
- Visual feedback: hotspots con/sin sensor
- Tooltip on hover
```

#### 2. RightPanel (Tabs)

```tsx
// web/src/components/configurador/RightPanel.tsx

Tabs:
  - Estación: lista sensores instalados + precios
  - POAs: CRUD POAs + sensores
  - Cuadro: opciones de cuadro eléctrico
  - Resumen: ⭐ cálculo total (equipos + instalación)
```

#### 3. API Client (lib/api.ts)

```typescript
class ApiClient {
  private token: string | null;
  
  async request<T>(endpoint, options): Promise<T> {
    // Añade Authorization header
    // Maneja errores
    // Retorna JSON tipado
  }
  
  // Métodos helper para cada endpoint
  async login(email, password) { ... }
  async getProjects() { ... }
  async getStation(id) { ... }
  async addStationSelection(stationId, data) { ... }
  // etc.
}
```

### Flujo de Usuario

```
1. Login (useAuthStore)
   ↓
2. Dashboard (lista proyectos)
   ↓
3. Click proyecto → Configurador
   ↓
4. Sidebar: lista estaciones, crear nueva
   ↓
5. Centro: SVG interactivo
   ├─ Click hotspot → selector sensor
   └─ Sensor añadido → actualiza UI
   ↓
6. Panel derecho: tabs
   ├─ Estación: ver sensores + eliminar
   ├─ POAs: crear POAs + añadir sensores
   ├─ Cuadro: añadir datalogger/protecciones
   └─ Resumen: ⭐ cálculo total en tiempo real
```

### Estado Global (Zustand)

#### useAuthStore

```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  login: (email, password) => Promise<void>,
  logout: () => void,
  checkAuth: () => Promise<void>
}
```

#### useConfiguratorStore

```typescript
{
  currentProjectId: string | null,
  currentStationId: string | null,
  setCurrentProject: (id) => void,
  setCurrentStation: (id) => void
}
```

## Base de Datos

### PostgreSQL en Docker

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: configurador
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  adminer:
    image: adminer:latest
    ports: ["8080:8080"]
```

### Migraciones

- **Archivo**: `api/src/db/migrations/001_initial_schema.sql`
- **Ejecución**: `npm run migrate` (lee todos los `.sql` en orden)
- **Triggers**: `updated_at` auto-actualizado en UPDATE

### Seed

- **Archivo**: `seed/seed_sensores_opciones.json`
- **Ejecución**: `npm run seed`
- **Estrategia**: `INSERT ... ON CONFLICT DO UPDATE` (idempotente)
- **Incluye**:
  - Hotspots (6)
  - Sensores (5)
  - Opciones de cuadro (4)
  - Usuarios demo (2: admin + usuario)

## Seguridad

### Backend

| Mecanismo | Implementación |
|-----------|----------------|
| Passwords | Bcrypt (10 rounds) |
| Auth | JWT (Bearer token) |
| RBAC | Middleware `requireAdmin` |
| CORS | Configurado origen frontend |
| Rate Limiting | 100 req/15min por IP |
| Headers | Helmet.js |
| SQL Injection | Prepared statements (`pg`) |
| Validation | Zod schemas |

### Frontend

| Mecanismo | Implementación |
|-----------|----------------|
| Token storage | localStorage |
| Auth guard | PrivateRoute wrapper |
| Token refresh | Manual (refresh endpoint) |
| XSS | React auto-escape |

## Escalabilidad

### Backend
- Pool de conexiones configurado (max: 20)
- Stateless (JWT) → horizontal scaling
- Logs estructurados (Morgan)

### Frontend
- Code splitting (React.lazy)
- Build optimizado (Vite)
- Assets cacheables

### Base de Datos
- Índices en FK
- JSONB para datos flexibles
- Triggers para updated_at

## Testing (Futuro)

### Backend
- Unit tests: lógica helpers (Jest)
- Integration tests: endpoints (Supertest)
- E2E: flujo completo (Playwright)

### Frontend
- Unit tests: componentes (Vitest + RTL)
- E2E: flujo usuario (Playwright)

## Deployment (Futuro)

### Backend
- Docker multi-stage build
- Variables de entorno (secrets)
- PM2 o similar para producción

### Frontend
- Build estático (`npm run build`)
- Servir con Nginx o CDN
- Variables de entorno en build time

### Base de Datos
- PostgreSQL managed (AWS RDS, DigitalOcean, etc.)
- Backups automáticos
- Read replicas (si necesario)

---

**Versión**: 1.0.0  
**Última actualización**: 2025-10-22

