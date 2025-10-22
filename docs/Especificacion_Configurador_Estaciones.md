# Configurador de Estaciones Meteorológicas — Especificación
*(Documento generado: 2025-10-22 08:54 UTC)*

## 1. Objetivo
Web app de **configurador de estaciones** para que el cliente combine sensores, calcule precio en vivo (equipos + cable por tramos + instalación + transporte) y solicite presupuesto. **Sin impuestos**.

## 2. Roles
- **Usuario**: gestiona proyectos/estaciones, configura sensores/POAs, descarga fichas, solicita presupuesto.
- **Admin**: CRUD catálogo (sensores, opciones de cuadro), hotspots, reglas de cableado, instalación (HQ, umbrales “viaje-contar”, tarifa diaria, transporte), usuarios.

## 3. UX/UI
- **Topbar** con lockup **Grupo Dilus** (dominante) + **GreenPowerMonitor** (secundario).
- **Sidebar** colapsable para proyectos/estaciones.
- **Centro**: **SVG** interactivo (hotspots).
- **Panel derecho (tabs)**: Estación / POAs / Cuadro eléctrico / Resumen.
- **Edición bidireccional**: SVG ↔ Panel sincronizados. **Un sensor por hotspot** (reemplazo).
- Estilo **premium tipo configurador de coche**: micro-animaciones, transiciones suaves, accesible.

## 4. Modelo de dominio (resumen)
- **Hotspot**: `key`, `x`, `y`, `label?` (coords en viewBox SVG).
- **Sensor**: `id`, `brand`, `model`, `type`, `allowed_hotspots[]`, `montaje_permitido` {estacion|poa|ambos}, `precio_base`, `cable_pricing[]`, `docs`, `images`.
- **OpcionCuadro**: `id`, `nombre`, `tipo` {datalogger|proteccion|otro}, `precio`, `attrs`.
- **POA**: `id`, `estacion_id`, `nombre`, `sensores[]`, `distancia_a_estacion_m`.
- **SeleccionSensor**: `id`, `sensor_id`, `contexto` {estacion|poa}, `hotspot_key?`, `metros_cable`.
- **Estacion**: `id`, `proyecto_id`, `nombre`, `provincia`, `hotspot_map` (snapshot), `selecciones[]`, `poas[]`, `opciones_cuadro[]`.
- **Proyecto**, **VariantePedido**.

## 5. Reglas de negocio
- **Cableado por tramos** (ej. 0–10, 10–20, 20–50, 50–100 m) por sensor o tipo. Precio por tramo sumado al sensor.
- **POA**: `distancia_a_estacion_m` sugiere `metros_cable` (editable).
- **Instalación**: HQ = **Madrid** (editable). Días = 1/día por estación + **ida** + **vuelta** (0.5 o 1 día por umbrales km “viaje-contar”). Transporte €/km o forfait. **Sin impuestos**.

## 6. Stack
- **FE**: React + Vite + TS, Zustand/Redux, React Router, shadcn/ui, lucide-react.
- **BE**: Node (Nest/Express), TS, JWT + RBAC, Swagger.
- **DB**: PostgreSQL + Prisma.
- **Ficheros**: S3/minio (datasheets/manuales).
- **Dev**: Docker Compose (api, web, db, minio, nginx).

## 7. Endpoints (REST)
Auth: `POST /auth/login`, `POST /auth/refresh`  
Hotspots: `GET/POST/PUT/DELETE /hotspots`, `PUT /estaciones/:id/hotspot-map`  
Sensores/Opciones: `GET/POST/PUT/DELETE /sensores`, `GET/POST/PUT/DELETE /opciones-cuadro`  
Proyectos/Estaciones: `GET/POST/PUT/DELETE /proyectos`, `GET/POST/PUT/DELETE /estaciones`, `POST /estaciones/:id/selecciones`  
POAs: `GET/POST/PUT/DELETE /poas`, `POST /poas/:id/sensores`  
Helpers: `GET /precios/cable?metros=...&sensor=...`, `GET /instalacion/estimacion?provincia=...&num_estaciones=...`

## 8. Aceptación
- Endpoints completos y protegidos; Swagger; Seed importado; UI **sin mocks**; sincronía SVG↔Panel; cálculo de **tramos** e **instalación viaje-contar** correcto; descargas de docs; Docker Compose end-to-end; tests en lógica clave e integración.

## 9. Identidad
Usar **assets/lockup_dilus_gpm_*.png** en navbar y PDF presupuesto. Gap ~0.3–0.35× altura principal. Clearspace ≥0.5× altura logo principal.

