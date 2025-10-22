# 🪄 Wizard de Configuración de Estaciones

## Descripción

El Wizard de Configuración de Estaciones es un asistente interactivo que guía al usuario paso a paso en la creación de configuraciones completas de estaciones meteorológicas para proyectos fotovoltaicos.

## Características

### ✨ Flujo Guiado en 6 Pasos

1. **Configuración Inicial**: Define provincia y tipos de estaciones
2. **Sensores de Viento**: Selecciona entre multiparamétricos (recomendado) o analógicos
3. **POAs**: Configura Planos de Orientación con distancias
4. **Radiación y Temperatura**: Configura sensores GHI, POA, temperatura de panel y ensuciamiento
5. **Cuadro Eléctrico**: Selecciona datalogger, protecciones, batería y kit solar
6. **Resumen**: Revisa y confirma la creación de las configuraciones

### 🎯 Características Principales

- **Sin datos hardcodeados**: Todo proviene de la API real
- **Recomendaciones inteligentes**: Sugiere sensores recomendados (ej: WS600, SMP10)
- **Auto-selección**: Pre-selecciona opciones óptimas basadas en las necesidades
- **Múltiples tipos**: Configura diferentes tipos de estaciones en un solo flujo
- **Clonación automática**: Crea múltiples estaciones con la misma configuración
- **Cálculo de costes en tiempo real**: Estima costes de sensores, cableado e instalación
- **Persistencia automática**: Guarda el progreso en localStorage
- **Validaciones**: Verifica que todos los datos necesarios estén completos

### 🔧 Componentes

```
wizard/
├── WizardEstaciones.tsx      # Componente principal y coordinador
├── Step0_Initial.tsx          # Configuración inicial
├── Step1_Wind.tsx             # Sensores de viento
├── Step2_POAs.tsx             # Configuración de POAs
├── Step3_Radiation.tsx        # Radiación y temperatura
├── Step4_ElectricalPanel.tsx # Cuadro eléctrico
├── Step5_Summary.tsx          # Resumen y persistencia
└── index.ts                   # Exportaciones
```

### 📊 Store de Estado (Zustand)

El wizard usa un store dedicado (`useWizardStore`) que maneja:

- Estado de apertura/cierre
- Paso actual
- Provincia del proyecto
- Tipos de estaciones con toda su configuración
- Persistencia en localStorage

### 🎨 UI/UX

- **Modal grande** (max-w-5xl) para una experiencia inmersiva
- **Progress Steps** visual con indicador de completado
- **Diseño moderno** con gradientes y sombras
- **Responsive** y accesible
- **Feedback visual** en cada acción
- **Animaciones suaves** en transiciones

### 🔌 Integración con API

El wizard utiliza los siguientes endpoints:

- `GET /sensores?type=...` - Listar sensores por tipo
- `GET /hotspots` - Obtener hotspots disponibles
- `GET /opciones-cuadro?tipo=...` - Opciones de cuadro eléctrico
- `POST /estaciones` - Crear estación
- `POST /estaciones/:id/selecciones` - Agregar sensor a estación
- `POST /poas` - Crear POA
- `POST /poas/:id/sensores` - Agregar sensor a POA
- `POST /estaciones/:id/panel-options` - Agregar opción de cuadro
- `GET /precios/cable?...` - Calcular precio de cableado
- `GET /instalacion/estimacion?...` - Estimar coste de instalación

### 🚀 Uso

```tsx
import { WizardEstaciones } from '@/components/wizard';

// En el componente
<WizardEstaciones
  open={wizardOpen}
  onOpenChange={setWizardOpen}
  projectId={projectId}
  provincia={project?.provincia}
  onComplete={handleWizardComplete}
/>
```

### 📝 Flujo de Datos

1. Usuario abre el wizard desde el botón en Sidebar
2. Completa cada paso con validaciones
3. Al finalizar, el wizard crea todas las estaciones mediante API
4. Las estaciones se crean con:
   - Sensores seleccionados (viento, radiación, temperatura)
   - POAs con sus sensores
   - Opciones de cuadro eléctrico
   - Clones según la cantidad especificada
5. Al completar, recarga el proyecto y cierra el wizard

### ⚡ Optimizaciones

- **Carga paralela** de sensores y opciones
- **Cálculo de costes en background**
- **Auto-selección inteligente** para reducir clics
- **Validaciones en tiempo real**
- **Guardado automático** del progreso

### 🎨 Personalización

El wizard es completamente personalizable mediante:

- Tailwind CSS classes
- Iconos de Lucide React
- Componentes UI reutilizables

### 🔒 Validaciones

Cada paso valida:

- **Paso 0**: Provincia y tipos con nombres y cantidades válidas
- **Paso 1**: Al menos un sensor de viento seleccionado
- **Paso 2**: Nombres de POA y distancias > 0 (o skip)
- **Paso 3**: Sensores de radiación/temperatura según configuración
- **Paso 4**: Datalogger obligatorio
- **Paso 5**: Verifica que todo esté completo antes de crear

### 📦 Dependencias

- React 18
- Zustand 4 (con persist middleware)
- Lucide React (iconos)
- TailwindCSS
- TypeScript

## Mantenimiento

Para añadir nuevos pasos o modificar el flujo:

1. Crear nuevo componente `StepX_Name.tsx`
2. Añadir paso en `WIZARD_STEPS` en `WizardEstaciones.tsx`
3. Actualizar el store si necesita nuevos campos
4. Integrar en el switch del componente principal
5. Actualizar validaciones y persistencia

## Testing

Para probar el wizard:

1. Asegúrate de tener datos en la BD (sensores, opciones)
2. Crea un proyecto con provincia
3. Abre el wizard desde el botón en Sidebar
4. Completa todos los pasos
5. Verifica que las estaciones se crean correctamente

## Troubleshooting

- **No aparecen sensores**: Verifica que existan en la BD y tengan `allowed_hotspots`
- **Error al crear**: Revisa logs de API y permisos del usuario
- **Wizard no se cierra**: Verifica que `onComplete` esté llamando correctamente
- **Costes incorrectos**: Revisa endpoints de helpers y datos de precios

