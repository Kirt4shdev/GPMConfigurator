# Changelog

Todas las notas de cambios notables para este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2025-10-22

### 🎉 Lanzamiento Inicial

Primera versión completa y funcional del **Configurador de Estaciones Meteorológicas** para Grupo Dilus + GreenPowerMonitor.

### ✨ Características Principales

#### Backend
- **API REST completa** con Express + TypeScript
- **Base de datos PostgreSQL** con driver `pg` (sin ORM)
- **Autenticación JWT** con roles (usuario, admin)
- **11 tablas** con relaciones y constraints
- **8 módulos** funcionales:
  - Auth (login, refresh, me)
  - Proyectos (CRUD)
  - Estaciones (CRUD + selecciones)
  - Sensores (catálogo + filtros)
  - Hotspots (catálogo)
  - POAs (CRUD + sensores)
  - Opciones de cuadro (catálogo)
  - Helpers (cálculos de precios)
- **Migraciones SQL** automatizadas
- **Seed desde JSON** con datos demo
- **Documentación Swagger/OpenAPI** interactiva
- **Seguridad**:
  - Passwords con bcrypt
  - Helmet.js para headers
  - CORS configurado
  - Rate limiting (100 req/15min)
  - Validación con Zod

#### Frontend
- **React 18** + Vite + TypeScript
- **Zustand** para estado global
- **React Router** con guards de autenticación
- **Tailwind CSS** + componentes UI custom
- **3 páginas principales**:
  - Login (con credenciales demo)
  - Dashboard (gestión de proyectos)
  - Configurador (SVG interactivo)
- **SVG Interactivo**:
  - Hotspots clickeables con tooltips
  - Selector de sensores modal
  - Visual feedback (con/sin sensor)
  - Filtrado por compatibilidad
- **Panel de configuración** con 4 tabs:
  - Estación (sensores + precios)
  - POAs (gestión completa)
  - Cuadro eléctrico (opciones)
  - Resumen (cálculo total)
- **Cliente API** sin mocks (todo real)
- **UX profesional** tipo configurador de coches

#### Infraestructura
- **Docker Compose** para PostgreSQL + Adminer
- **Scripts de inicio** para Windows (PowerShell) y Unix (bash)
- **Variables de entorno** configurables
- **Documentación completa**:
  - README.md (guía de uso)
  - ARQUITECTURA.md (técnico)
  - PROYECTO_COMPLETO.md (resumen)
  - openapi.json (API spec)

### 🧮 Lógica de Negocio

#### Cable por Tramos
- Cálculo acumulativo según tramos configurados por sensor
- Ejemplo: 0-10m (0€), 10-20m (35€), 20-50m (75€), 50-100m (140€)
- Frontend y backend calculan consistentemente

#### Instalación "Viaje-Contar"
- Días = ida + instalación + vuelta
- Ida/vuelta: 0.5 días si distancia ≤ umbral, sino 1 día
- Instalación: 1 día por estación
- Costos: días × tarifa + distancia × 2 × €/km
- Configurable desde admin (HQ, umbrales, tarifas)

### 📊 Datos Demo

#### Usuarios
- **Admin**: admin@gpm.com / admin123
- **Usuario**: user@gpm.com / user123

#### Catálogo
- **6 hotspots** (mástil, brazo POA, pluviómetro, etc.)
- **5 sensores** (radiación, viento, multiparamétrico, temperatura panel, precipitación)
- **4 opciones de cuadro** (dataloggers, protecciones)

### 🎨 Diseño

- Paleta corporativa Grupo Dilus + GPM
- Logos integrados (horizontal + apilado)
- Animaciones suaves
- Responsive (optimizado desktop)
- Accesible (roles ARIA, keyboard-friendly)

### 🔒 Seguridad

- ✅ Bcrypt para passwords (10 rounds)
- ✅ JWT con expiración configurable
- ✅ RBAC en endpoints sensibles
- ✅ SQL injection prevenido (prepared statements)
- ✅ XSS prevenido (React auto-escape)
- ✅ CSRF no aplica (API stateless)
- ✅ Rate limiting en API

### 📝 Documentación

- [x] README completo con instrucciones paso a paso
- [x] ARQUITECTURA con diagramas y explicaciones técnicas
- [x] PROYECTO_COMPLETO con listado de entregables
- [x] CHANGELOG con notas de versión
- [x] OpenAPI JSON exportado
- [x] Comentarios en código crítico

### 🧪 Testing

- [ ] Unit tests backend (pendiente)
- [ ] Integration tests API (pendiente)
- [ ] Unit tests frontend (pendiente)
- [ ] E2E tests (pendiente)

*Nota: Testing queda como mejora futura.*

### 📦 Deployment

- [ ] Build de producción (pendiente)
- [ ] Docker para backend/frontend (pendiente)
- [ ] CI/CD pipeline (pendiente)

*Nota: Deployment queda como mejora futura.*

### 🐛 Bugs Conocidos

Ninguno reportado en versión inicial.

### ⚠️ Limitaciones Conocidas

1. **Provincias**: Coordenadas hardcodeadas para cálculo de distancias (10 provincias principales)
2. **POA Sensors**: En frontend aún no implementado selector detallado (solo CRUD básico)
3. **Responsive**: Optimizado para desktop, puede requerir ajustes en móvil
4. **Imágenes de sensores**: URLs de ejemplo (no reales)

### 📚 Stack Tecnológico

#### Backend
- Node.js 18+
- Express 4
- TypeScript 5
- PostgreSQL 16 (pg driver)
- JWT (jsonwebtoken)
- Zod (validación)
- Swagger/OpenAPI
- Bcrypt, Helmet, CORS, Morgan

#### Frontend
- React 18
- Vite 5
- TypeScript 5
- Zustand 4
- React Router 6
- Tailwind CSS 3
- Lucide React (iconos)

#### Infraestructura
- Docker Compose
- PostgreSQL 16
- Adminer

### 🎯 Cumplimiento de Requisitos

✅ **Sin Prisma ni ORM**: Se usa `pg` directamente  
✅ **Sin Docker para backend/frontend**: Solo para PostgreSQL  
✅ **Sin mocks**: Todo el frontend consume API real  
✅ **Seed desde JSON**: Importa `seed/seed_sensores_opciones.json`  
✅ **SVG local**: Asset copiado y usado correctamente  
✅ **Cálculo por tramos**: Implementado y funcional  
✅ **Viaje-contar**: Implementado según especificación  
✅ **UI elegante**: Estilo profesional tipo configurador de coches  
✅ **Documentación Swagger**: Disponible en /docs  

---

## [Próximas Versiones]

### [1.1.0] - Planificado
- [ ] Tests unitarios e integración
- [ ] Selector detallado de sensores para POAs en frontend
- [ ] Upload de documentación de sensores
- [ ] Export de configuración a PDF
- [ ] Más provincias españolas con coordenadas reales

### [1.2.0] - Planificado
- [ ] Multi-idioma (ES/EN)
- [ ] Tema oscuro
- [ ] Notificaciones en tiempo real
- [ ] Historial de cambios (audit log)

### [2.0.0] - Futuro
- [ ] Marketplace de sensores
- [ ] Integración con ERP
- [ ] API pública con rate limiting por API key
- [ ] Mobile app (React Native)

---

## Formato de Versiones

Sigue [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios incompatibles en API
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Bug fixes compatibles

---

**Mantenedores**: Equipo Grupo Dilus + GreenPowerMonitor  
**Licencia**: Propietario

