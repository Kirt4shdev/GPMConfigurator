# 🪄 Guía de Uso - Wizard de Configuración de Estaciones

## 📖 Introducción

El **Wizard de Configuración de Estaciones** es una herramienta interactiva que te guía paso a paso para crear configuraciones completas de estaciones meteorológicas en minutos, no en horas.

## 🎯 ¿Cuándo usar el Wizard?

Usa el wizard cuando necesites:

- ✅ Crear múltiples estaciones similares rápidamente
- ✅ Configurar estaciones con diferentes tipos (Principal, Auxiliar, etc.)
- ✅ Obtener recomendaciones de sensores y equipos
- ✅ Calcular costes en tiempo real
- ✅ Asegurar que no falta ninguna configuración importante

## 🚀 Pasos de Uso

### 1. Abrir el Wizard

1. Abre un proyecto en el Configurador
2. En el Sidebar izquierdo, verás dos botones:
   - **🪄 Asistente (Wizard)** ← Click aquí (botón con gradiente púrpura-azul)
   - "+ Nueva Estación" (método manual tradicional)

### 2. Paso 0: Configuración Inicial

**¿Qué se configura?**
- Provincia del proyecto (para cálculo de instalación)
- Tipos de estaciones y cantidades

**Ejemplo:**
```
Provincia: Madrid

Tipos de Estación:
1. Estación Principal - Cantidad: 1
2. Estación Auxiliar - Cantidad: 3
```

**💡 Consejo:** Si todas las estaciones son iguales, crea un solo tipo con cantidad 4.

### 3. Paso 1: Sensores de Viento

**¿Qué se configura?**
- Tipo de medición de viento

**Opciones:**

#### 🌟 Multiparamétrico (Recomendado)
- **Ventajas:**
  - Sensor todo-en-uno
  - Mide velocidad, dirección, temperatura, presión, humedad
  - Fácil instalación
  - Menos cableado
- **Ejemplo:** Lufft WS600, Campbell ATMOS41

#### 🔧 Analógico
- **Ventajas:**
  - Mayor flexibilidad
  - Sensores individuales por parámetro
- **Componentes:**
  - Anemómetro (velocidad)
  - Veleta (dirección)
- **Ejemplo:** Thies 4.3351, NRG #40C

**Acción:** El wizard te mostrará los sensores disponibles filtrados por tipo. Los recomendados aparecen con badge verde.

**💡 Consejo:** Usa multiparamétrico salvo que tengas requisitos específicos.

### 4. Paso 2: POAs (Planos de Orientación)

**¿Qué se configura?**
- Número de POAs
- Distancia de cada POA a la estación

**¿Qué es un POA?**
Un POA es un plano inclinado donde se instalan paneles y sensores para medir radiación en la misma orientación que los paneles solares.

**Ejemplo:**
```
POA 1 (Este) - 10 metros
POA 2 (Oeste) - 15 metros
POA 3 (Sur) - 12 metros
```

**💡 Consejo:** La distancia se usa automáticamente como sugerencia para la longitud de cable de sensores en ese POA.

**⏭️ Opción:** Puedes omitir este paso si solo necesitas medición horizontal.

### 5. Paso 3: Radiación y Temperatura

**¿Qué se configura?**

#### En la Estación Principal:
- ☀️ **Radiación Horizontal (GHI)**
  - Medición de radiación solar horizontal
  - Sensor sugerido: SMP10

#### En cada POA:
- 🌡️ **Temperatura de Panel**
  - Cantidad de sensores por POA
  - Tipo: PT100 o termopares
  
- ☀️ **Radiación Inclinada**
  - Piranómetros en el plano del POA
  
- 💧 **Ensuciamiento** (si disponible)
  - Sensores de soiling

**💡 Consejo:** Para POAs grandes, usa al menos 1 sensor de temperatura por cada 10-15 paneles.

### 6. Paso 4: Cuadro Eléctrico

**¿Qué se configura?**

#### 💻 Datalogger (Obligatorio)
- Sistema de adquisición de datos
- Opciones: CR1000X, Edge-01, etc.

#### 🛡️ Protecciones
- Sobretensiones
- Fusibles
- Descargadores
- (Selección múltiple)

#### 🔋 Sistema de Alimentación
1. **Horas de autonomía deseadas** (ej: 24h)
2. El wizard sugiere automáticamente:
   - Batería apropiada
   - Kit solar compatible

**💡 Consejo:** 24-48 horas de autonomía es estándar para la mayoría de instalaciones.

### 7. Paso 5: Resumen y Confirmación

**¿Qué verás?**

#### Resumen por Tipo
Para cada tipo de estación:
- Sensores de viento
- Radiación horizontal
- Número de POAs
- Configuración de cuadro eléctrico
- Cantidad a crear

#### Estimación de Coste
Desglose detallado:
- 💰 **Sensores:** €X,XXX.XX
- 🔌 **Cableado:** €XXX.XX
- 🔧 **Opciones:** €X,XXX.XX
- 🚚 **Instalación:** €XXX.XX
- **TOTAL (sin IVA):** €XX,XXX.XX

#### Crear Estaciones
- Click en **"Crear X Estaciones"**
- El wizard crea todo automáticamente:
  - Estaciones base
  - Sensores en hotspots
  - POAs con sus sensores
  - Opciones de cuadro
  - Clones según cantidad

**⏱️ Progreso:** Verás un indicador en tiempo real de lo que se está creando.

## ✅ Finalización

Al completar:
1. ✅ Todas las estaciones aparecen en el proyecto
2. ✅ Cada estación tiene su configuración completa
3. ✅ Puedes verlas y editarlas en el configurador
4. ✅ El wizard se cierra automáticamente

## 🔄 Flujo Múltiples Tipos

Si configuras múltiples tipos (ej: Principal + Auxiliar):

1. Completas Paso 0 (defines 2 tipos)
2. Completas Pasos 1-4 para **Tipo 1** (Principal)
3. Automáticamente vuelves al Paso 1 para **Tipo 2** (Auxiliar)
4. Completas Pasos 1-4 para Tipo 2
5. Vas al Paso 5 (Resumen de todos los tipos)
6. Confirmas y se crean todas las estaciones

**💡 Indicador:** En la parte superior verás: "Configurando: [Nombre del Tipo] (X estaciones) • Tipo 1 de 2"

## 🎯 Ventajas vs. Creación Manual

| Característica | Wizard | Manual |
|---------------|--------|--------|
| **Tiempo** | 5-10 min | 30-60 min |
| **Recomendaciones** | ✅ Automáticas | ❌ Debes saber qué elegir |
| **Validación** | ✅ En cada paso | ❌ Solo al guardar |
| **Cálculo de costes** | ✅ En tiempo real | ❌ Manual |
| **Clonación** | ✅ Automática | ❌ Manual |
| **Errores** | ✅ Prevenidos | ⚠️ Posibles |

## 🆘 Solución de Problemas

### "No aparecen sensores"
**Causa:** No hay sensores de ese tipo en la base de datos  
**Solución:** Ve al Panel de Administración > Sensores y añade sensores del tipo necesario

### "No puedo continuar al siguiente paso"
**Causa:** Falta completar campos obligatorios  
**Solución:** Verifica que todos los campos requeridos estén llenos y válidos

### "Error al crear estaciones"
**Causa:** Problema de conexión o permisos  
**Solución:** 
1. Verifica tu conexión a internet
2. Asegúrate de tener permisos de creación
3. Revisa la consola del navegador para más detalles

### "El wizard se cerró accidentalmente"
**No hay problema!** El wizard guarda tu progreso automáticamente en localStorage. Al volver a abrirlo, puedes continuar donde lo dejaste.

## 🎨 Características Premium

- **Diseño moderno** con gradientes y sombras
- **Progress Steps** visuales
- **Auto-sugerencias** de sensores recomendados
- **Badges** informativos (Recomendado, etc.)
- **Tooltips** con explicaciones
- **Animaciones** suaves
- **Feedback en tiempo real**
- **Responsive** para cualquier dispositivo

## 📞 Soporte

Si tienes problemas o sugerencias:
1. Revisa esta guía
2. Consulta `WIZARD_IMPLEMENTACION.md` para detalles técnicos
3. Consulta `web/src/components/wizard/README.md` para documentación de desarrollo

## 🎉 ¡Disfruta del Wizard!

El wizard está diseñado para hacer tu trabajo más fácil, rápido y preciso. ¡Aprovecha todas sus características!

**Tip final:** Usa el wizard para configuraciones estándar y el método manual para casos muy específicos o experimentales.

