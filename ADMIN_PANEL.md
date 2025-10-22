# Panel de Administración - GPM Configurador

## Descripción

El panel de administración permite gestionar completamente el catálogo, reglas y usuarios del configurador de estaciones meteorológicas.

## Acceso al Panel

### URL
**http://localhost:5173/admin**

### Requisitos de Acceso
- Usuario autenticado con rol `admin`
- Credenciales de administrador:
  - **Email**: `admin@gpm.com`
  - **Password**: `admin123`

### Desde el Dashboard
Los usuarios con rol admin verán un botón "Panel Admin" en el dashboard principal para acceder directamente.

## Funcionalidades

### 1. **Overview** (`/admin`)
- Vista de resumen con KPIs del sistema
- Contadores de sensores, hotspots, opciones, proyectos y estaciones
- Estado general del sistema

### 2. **Gestión de Sensores** (`/admin/catalogo/sensores`)
- **Listar**: Todos los sensores del catálogo con filtros por tipo y búsqueda
- **Crear**: Nuevos sensores con todos sus atributos
  - ID, marca, modelo, tipo
  - Precio base
  - Montaje permitido (estación, POA, ambos)
  - Hotspots permitidos
  - URLs de documentación e imágenes
- **Editar**: Modificar cualquier sensor existente
- **Eliminar**: Borrar sensores del catálogo
- **Filtros**: Por tipo de sensor y búsqueda por ID/marca/modelo

### 3. **Gestión de Hotspots** (`/admin/catalogo/hotspots`)
- **Vista de Tabla**: Lista todos los hotspots con sus coordenadas
- **Editor Visual SVG**: 
  - Visualización del SVG de la estación
  - Drag & drop para reposicionar hotspots
  - Guardado automático de posiciones
  - Coordenadas en el espacio del viewBox del SVG
- **CRUD Completo**: Crear, editar y eliminar hotspots

### 4. **Opciones de Cuadro** (`/admin/catalogo/opciones`)
- Gestión de dataloggers, protecciones y otros componentes
- **CRUD**: Crear, editar, eliminar opciones
- Campos: ID, nombre, tipo, precio y atributos personalizados

### 5. **Reglas de Instalación** (`/admin/reglas/instalacion`)
- **Configuración de parámetros**:
  - Ciudad HQ (base de operaciones)
  - Tarifa diaria del técnico (€)
  - Transporte (€/km)
  - Umbrales de viaje (ida y vuelta en km)
- **Calculadora de prueba**: 
  - Prueba la estimación con diferentes provincias y número de estaciones
  - Visualiza resultados en tiempo real

### 6. **Import/Export de Datos** (`/admin/datos`)
- **Exportar**: 
  - Descarga JSON con todo el catálogo
  - Incluye sensores, hotspots y opciones de cuadro
  - Formato versionado con metadatos
- **Importar**:
  - Carga masiva desde archivo JSON
  - Operación upsert (insert o update)
  - No elimina datos existentes
  - Validación de formato

### 7. **Gestión de Usuarios** (`/admin/usuarios`)
- Lista de todos los usuarios del sistema
- **Cambio de roles**: 
  - Promover usuarios a admin
  - Degradar admins a usuario
  - No se puede cambiar el rol propio
- Información: email, nombre, rol, fecha de registro

## Arquitectura Técnica

### Backend (API)
- **Endpoints**: `/api/admin/*`
- **Protección**: Middleware `requireAdmin` en todas las rutas
- **Controlador**: `api/src/modules/admin/admin.controller.ts`
- **Rutas**: `api/src/modules/admin/admin.routes.ts`

### Frontend
- **Guard**: `AdminGuard` - Redirige si no es admin
- **Layout**: `AdminLayout` - Sidebar con navegación
- **Páginas**: `web/src/pages/admin/*`
- **Rutas**: Integradas en `App.tsx` con protección

### API Endpoints Implementados

```
GET    /api/admin/usuarios          - Lista usuarios
PUT    /api/admin/usuarios/:id/role - Cambia rol de usuario

GET    /api/admin/export            - Exporta catálogo
POST   /api/admin/import            - Importa catálogo

GET    /api/admin/config/instalacion - Obtiene config de instalación
PUT    /api/admin/config/instalacion - Actualiza config de instalación

GET    /api/admin/overview           - Obtiene KPIs del sistema

GET    /api/sensores                 - Lista sensores
POST   /api/sensores                 - Crea sensor
PUT    /api/sensores/:id             - Actualiza sensor
DELETE /api/sensores/:id             - Elimina sensor

GET    /api/hotspots                 - Lista hotspots
POST   /api/hotspots                 - Crea hotspot
PUT    /api/hotspots/:key            - Actualiza hotspot
DELETE /api/hotspots/:key            - Elimina hotspot

GET    /api/opciones-cuadro          - Lista opciones
POST   /api/opciones-cuadro          - Crea opción
PUT    /api/opciones-cuadro/:id      - Actualiza opción
DELETE /api/opciones-cuadro/:id      - Elimina opción
```

## Formato de Datos

### Export/Import JSON Structure
```json
{
  "version": "1.0",
  "exported_at": "2025-10-22T12:00:00.000Z",
  "exported_by": "admin@gpm.com",
  "data": {
    "hotspots": [
      {
        "key": "H1",
        "x": 100,
        "y": 200,
        "label": "Posición 1"
      }
    ],
    "sensors": [
      {
        "id": "sensor_id",
        "brand": "Marca",
        "model": "Modelo",
        "type": "viento",
        "montaje_permitido": "estacion",
        "precio_base": 1200.00,
        "allowed_hotspots": ["H1", "H2"],
        "cable_pricing": [],
        "docs": {
          "datasheet_url": "https://...",
          "manual_url": "https://..."
        },
        "images": {
          "icon_url": "https://...",
          "photo_url": "https://..."
        },
        "mediciones": []
      }
    ],
    "panel_options": [
      {
        "id": "option_id",
        "nombre": "Datalogger X",
        "tipo": "datalogger",
        "precio": 500.00,
        "attrs": {}
      }
    ]
  }
}
```

## Seguridad

- ✅ Todas las rutas protegidas con JWT
- ✅ Verificación de rol admin en backend
- ✅ Guard de frontend para prevenir acceso no autorizado
- ✅ Redirección automática si no es admin
- ✅ No se puede cambiar el propio rol
- ✅ Validación de payloads en backend

## UI/UX

- **Diseño**: Limpio y profesional con shadcn/ui
- **Navegación**: Sidebar con iconos y labels claros
- **Feedback**: Toasts para todas las operaciones
- **Loading states**: Spinners durante operaciones async
- **Responsive**: Adaptado para desktop y móvil
- **Breadcrumbs**: Contexto visual de ubicación

## Testing

### Flujo de Prueba
1. Login con credenciales admin
2. Acceder a `/admin` desde dashboard o directamente
3. Probar cada sección:
   - Crear, editar, eliminar sensor
   - Mover hotspots en el editor SVG
   - Cambiar configuración de instalación
   - Exportar e importar datos
   - Cambiar rol de un usuario

### Casos de Prueba
- ✅ Usuario no admin no puede acceder
- ✅ Usuario no autenticado es redirigido al login
- ✅ Todas las operaciones CRUD funcionan
- ✅ Editor SVG actualiza coordenadas correctamente
- ✅ Import no elimina datos existentes
- ✅ Export incluye todos los datos

## Próximas Mejoras (Futuro)

- [ ] Logs de auditoría de cambios
- [ ] Historial de versiones de catálogo
- [ ] Plantillas de cableado reutilizables
- [ ] Gestión de permisos granulares
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Paginación server-side en tablas grandes
- [ ] Validación con Zod en formularios
- [ ] Preview de cambios antes de importar

## Soporte

Para problemas o preguntas sobre el panel de admin:
- Revisar logs del backend en consola
- Verificar permisos de usuario en la base de datos
- Comprobar que los endpoints estén respondiendo correctamente

