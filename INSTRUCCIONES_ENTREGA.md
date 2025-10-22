# 📦 Instrucciones de Entrega

## Configurador de Estaciones Meteorológicas v1.0.0

---

## 📂 Contenido del Paquete

Este paquete contiene un sistema completo y funcional listo para ser desplegado.

### Estructura de Carpetas

```
GPMConfigurator/
│
├── 📁 api/                    # Backend completo (Node + Express + TypeScript)
├── 📁 web/                    # Frontend completo (React + Vite + TypeScript)
├── 📁 assets/                 # Logos y SVG de la estación
├── 📁 seed/                   # Datos iniciales (JSON)
├── 📁 docs/                   # Especificación original
│
├── 📄 docker-compose.yml      # PostgreSQL + Adminer
├── 📄 .env.example            # Variables de entorno
├── 📄 .gitignore              # Git ignore
│
├── 📄 README.md               # ⭐ EMPEZAR AQUÍ - Guía principal
├── 📄 ARQUITECTURA.md         # Documentación técnica
├── 📄 PROYECTO_COMPLETO.md    # Listado de entregables
├── 📄 RESUMEN_EJECUTIVO.md    # Resumen para stakeholders
├── 📄 CHANGELOG.md            # Historial de versiones
├── 📄 openapi.json            # Especificación API
│
├── 📄 start.sh                # Script inicio Linux/macOS
└── 📄 start.ps1               # Script inicio Windows
```

---

## 🚀 Instalación Rápida

### Prerrequisitos

Asegúrate de tener instalado:
- ✅ **Node.js** 18 o superior ([Descargar](https://nodejs.org/))
- ✅ **Docker Desktop** ([Descargar](https://www.docker.com/products/docker-desktop))
- ✅ **Git** (opcional, pero recomendado)

### Opción 1: Script Automático (Recomendado)

#### Windows (PowerShell)
```powershell
.\start.ps1
```

#### Linux/macOS
```bash
chmod +x start.sh
./start.sh
```

Esto instalará todo automáticamente. Luego, en **dos terminales separadas**:

**Terminal 1 (Backend):**
```bash
cd api
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd web
npm run dev
```

### Opción 2: Manual

Si prefieres instalación manual, consulta el **README.md** para instrucciones paso a paso.

---

## 🌐 Acceso al Sistema

Una vez que ambos servidores estén corriendo:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Aplicación Web** | http://localhost:5173 | Ver abajo |
| **API REST** | http://localhost:3000 | - |
| **Documentación API** | http://localhost:3000/docs | - |
| **Base de Datos GUI** | http://localhost:8080 | postgres / postgres |

### Usuarios Demo

El sistema viene con dos usuarios precargados:

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| **Admin** | admin@gpm.com | admin123 | CRUD catálogo + config |
| **Usuario** | user@gpm.com | user123 | Gestión proyectos/estaciones |

---

## 📖 Documentación Disponible

Lee estos documentos **en orden** para entender el sistema:

1. **README.md** → Guía de instalación y uso básico
2. **RESUMEN_EJECUTIVO.md** → Visión general del proyecto
3. **ARQUITECTURA.md** → Detalles técnicos y diagramas
4. **PROYECTO_COMPLETO.md** → Lista completa de archivos
5. **CHANGELOG.md** → Historial de versiones

Para API:
- **http://localhost:3000/docs** → Swagger interactivo
- **openapi.json** → Especificación OpenAPI para import

---

## 🎯 Prueba Rápida del Sistema

### Flujo de Usuario Básico

1. **Login**: Usa `admin@gpm.com` / `admin123`
2. **Crear Proyecto**: Click en "Nuevo Proyecto"
3. **Crear Estación**: Dentro del proyecto, click "Nueva Estación"
4. **Configurar Sensores**:
   - Haz click en los puntos (hotspots) del esquema SVG
   - Selecciona un sensor compatible del modal
   - El sensor se añade automáticamente
5. **Añadir POA**:
   - Tab "POAs" en panel derecho
   - Click "Nuevo" y añade distancia
6. **Opciones de Cuadro**:
   - Tab "Cuadro"
   - Añade datalogger y protecciones
7. **Ver Resumen**:
   - Tab "Resumen"
   - Verás el cálculo completo:
     - Sensores + cable
     - Opciones de cuadro
     - Instalación (días + transporte)
     - **Total sin impuestos**

---

## 🔧 Solución de Problemas

### Error: "Docker no está corriendo"
```bash
# Iniciar Docker Desktop y luego:
docker-compose up -d
```

### Error: "Puerto 3000 ocupado"
```bash
# Ver qué proceso usa el puerto
# Windows
netstat -ano | findstr :3000
# Linux/macOS
lsof -i :3000

# Cambiar puerto en api/.env
PORT=3001
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
cd api
rm -rf node_modules package-lock.json
npm install

cd ../web
rm -rf node_modules package-lock.json
npm install
```

### Base de datos no conecta
```bash
# Reiniciar contenedor
docker-compose down
docker-compose up -d

# Esperar 5 segundos
sleep 5

# Verificar logs
docker-compose logs postgres
```

---

## 🎓 Capacitación

### Para Desarrolladores

Leer en orden:
1. ARQUITECTURA.md (stack y estructura)
2. Código en `api/src/` (backend)
3. Código en `web/src/` (frontend)
4. API docs en http://localhost:3000/docs

### Para Product Owners / Managers

Leer en orden:
1. RESUMEN_EJECUTIVO.md (visión general)
2. CHANGELOG.md (features implementadas)
3. Probar el sistema (flujo básico arriba)

### Para Usuarios Finales

1. Credenciales de acceso
2. Tutorial en video (futuro)
3. Manual de usuario (futuro)

---

## 📦 Despliegue a Producción

### Checklist Pre-Deployment

- [ ] Cambiar `JWT_SECRET` en `.env` del backend
- [ ] Cambiar contraseñas de usuarios demo
- [ ] Configurar `CORS_ORIGIN` con dominio real
- [ ] Usar PostgreSQL managed (no Docker)
- [ ] Configurar backups automáticos de DB
- [ ] Habilitar HTTPS (Let's Encrypt)
- [ ] Configurar logs centralizados
- [ ] Añadir monitoring (Sentry, Datadog, etc.)

### Opción 1: VPS Tradicional

```bash
# Backend
cd api
npm run build
PORT=3000 npm start  # con PM2 o similar

# Frontend
cd web
npm run build
# Servir carpeta dist/ con Nginx
```

### Opción 2: Contenedores (Futuro)

Crear Dockerfiles para backend y frontend y desplegar en:
- AWS ECS / Fargate
- Google Cloud Run
- DigitalOcean App Platform
- Heroku
- Vercel (frontend) + Railway (backend)

---

## 🛠️ Extensión y Mantenimiento

### Añadir Nuevo Sensor

1. Admin login
2. Ir a catálogo de sensores (pendiente UI admin)
3. O editar `seed/seed_sensores_opciones.json`
4. Volver a ejecutar `npm run seed` en backend

### Añadir Nuevo Hotspot

1. Editar SVG en `assets/infografia_Renovables_centered.svg`
2. Añadir hotspot en seed JSON
3. Ejecutar seed
4. Frontend detectará automáticamente

### Modificar Cálculos

- **Cable**: `api/src/modules/helpers/helpers.controller.ts`
- **Instalación**: Mismo archivo, función `estimateInstallation`

---

## 📞 Soporte

Para preguntas técnicas:
- Revisa documentación primero
- Consulta Swagger docs para API
- Revisa logs de backend/frontend

Para bugs o mejoras:
- Crear issue en repositorio (si aplica)
- Documentar pasos para reproducir
- Incluir logs relevantes

---

## 🎉 ¡Listo!

El sistema está completo y funcional. Solo necesitas:
1. Instalar prerrequisitos (Node, Docker)
2. Ejecutar scripts de inicio
3. Acceder a http://localhost:5173
4. Disfrutar configurando estaciones

**¡Éxito con tu proyecto!** 🚀

---

📅 **Versión**: 1.0.0  
📦 **Fecha**: 22 de octubre de 2025  
👨‍💻 **Desarrollado para**: Grupo Dilus + GreenPowerMonitor  
📄 **Licencia**: Propietario

