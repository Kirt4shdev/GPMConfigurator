# 🔧 Wizard - Guía de Troubleshooting

## Problema: No aparecen sensores en el Paso 1 (Viento)

### Síntomas
- Al seleccionar "Multiparamétrico" o "Analógico" no se muestra ningún sensor
- Aparece mensaje: "No hay sensores disponibles de tipo..."

### Diagnóstico

El wizard ahora incluye información de debug que te ayudará a identificar el problema:

1. **Ver tipos disponibles en BD**: Click en el desplegable "Ver tipos disponibles en BD"
2. **Revisar la consola del navegador** (F12):
   ```
   Hotspots loaded: X
   All sensors loaded: Y
   Filtering sensors for type: multiparametrico
   Valid types for search: ['multiparametrico', 'viento_multiparametrico', ...]
   Sensors after type filter: Z
   Sensors after hotspot filter: W
   ```

### Soluciones

#### 1. **No hay sensores en la base de datos**

**Identificar**: La consola muestra `All sensors loaded: 0`

**Solución**: Añadir sensores desde el Panel de Administración

```sql
-- Ejemplo: Añadir sensor multiparamétrico
INSERT INTO sensors (
  id, brand, model, type, montaje_permitido, precio_base,
  allowed_hotspots_json, cable_pricing_json
) VALUES (
  'ws600-001',
  'Lufft',
  'WS600-UMB',
  'multiparametrico',  -- O 'viento_multiparametrico'
  'estacion',
  1250.00,
  '["H1_mast_top", "H2_mast_middle"]',
  '[{"min_metros": 0, "max_metros": 50, "precio_por_metro": 2.5}]'
);
```

#### 2. **Tipo de sensor incorrecto en BD**

**Identificar**: 
- La consola muestra `All sensors loaded: 10` pero `Sensors after type filter: 0`
- Los tipos en BD no coinciden con los buscados

**Tipos válidos para el wizard**:

**Multiparamétrico**:
- `multiparametrico`
- `viento_multiparametrico`
- `estacion_meteorologica`

**Analógico**:
- `viento`
- `anemometro`
- `veleta`
- `viento_analogico`

**Solución**: Actualizar el campo `type` en la BD

```sql
-- Ejemplo: Corregir tipo de sensor
UPDATE sensors 
SET type = 'multiparametrico' 
WHERE model LIKE '%WS600%' OR model LIKE '%ATMOS%';

UPDATE sensors 
SET type = 'viento' 
WHERE type = 'anemómetro' OR model LIKE '%anem%';
```

#### 3. **Falta campo `allowed_hotspots_json`**

**Identificar**: `Sensors after type filter: 5` pero `Sensors after hotspot filter: 0`

**Solución**: Añadir hotspots permitidos

```sql
-- Ejemplo: Actualizar hotspots permitidos
UPDATE sensors 
SET allowed_hotspots_json = '["H1_mast_top", "H2_mast_middle", "H1_viento"]'
WHERE type IN ('multiparametrico', 'viento', 'viento_multiparametrico');

-- O dejar vacío para permitir cualquier hotspot
UPDATE sensors 
SET allowed_hotspots_json = '[]'
WHERE type IN ('multiparametrico', 'viento');
```

#### 4. **No hay hotspots de viento en la BD**

**Identificar**: La consola muestra `Hotspots loaded: 0`

**Solución**: Añadir hotspots desde el Panel de Administración

```sql
-- Ejemplo: Añadir hotspot de viento
INSERT INTO hotspots (key, nombre, descripcion)
VALUES 
  ('H1_mast_top', 'Mástil Superior', 'Parte superior del mástil'),
  ('H2_mast_middle', 'Mástil Medio', 'Parte media del mástil'),
  ('H1_viento', 'Sensor de Viento', 'Ubicación sensor de viento');
```

### Verificación

Después de aplicar las soluciones:

1. **Refresca el wizard** (cierra y vuelve a abrir)
2. **Verifica en la consola**:
   - `All sensors loaded: X` debe ser > 0
   - `Sensors after type filter: Y` debe ser > 0
   - `Sensors after hotspot filter: Z` debe ser > 0

## Problema: Se pierden datos al navegar entre pasos

### Síntomas
- Al hacer click en "Anterior" se borran las selecciones
- Al volver a un paso anterior está vacío

### Solución ✅

Este problema ya está resuelto en la última versión. El wizard ahora:

1. **Guarda automáticamente** cada paso en el store de Zustand
2. **Restaura los datos** cuando vuelves a un paso anterior
3. **Persiste en localStorage** para no perder trabajo si cierras el navegador

### Verificación

1. Completa el Paso 1 (selecciona sensores de viento)
2. Avanza al Paso 2
3. Click en "Anterior"
4. ✅ Los sensores seleccionados deben seguir ahí

## Problema: Error al crear estaciones

### Síntomas
- El wizard se detiene en el Paso 5
- Mensaje de error al intentar crear

### Soluciones posibles

#### 1. **Problema de permisos**

**Error**: `401 Unauthorized` o `403 Forbidden`

**Solución**: 
- Verifica que tu usuario tenga permisos de creación
- Re-inicia sesión

#### 2. **Falta provincia en el proyecto**

**Error**: `provincia is required`

**Solución**: 
- El wizard debe pedir provincia en el Paso 0
- Si no lo hace, actualiza el proyecto manualmente

#### 3. **Sensor no encontrado**

**Error**: `Sensor XYZ not found`

**Solución**: 
- El sensor fue eliminado de la BD
- Vuelve al paso correspondiente y selecciona otro sensor

#### 4. **Hotspot no válido**

**Error**: `Invalid hotspot key`

**Solución**: 
- El hotspot no existe en la BD
- Verifica hotspots disponibles desde Admin

## Problema: Costes no se calculan

### Síntomas
- En el Paso 5, los costes aparecen como "No se pudo calcular"
- Los valores son 0 o incorrectos

### Soluciones

#### 1. **Helpers no implementados en backend**

**Verificar**: 
```bash
curl http://localhost:3000/api/precios/cable?sensor_id=XXX&metros=10
curl http://localhost:3000/api/instalacion/estimacion?provincia=Madrid&num_estaciones=1
```

**Si falla**: Los endpoints de helpers no están implementados (opcional)

**Impacto**: El wizard funciona, solo no muestra estimación de costes

#### 2. **Sensores sin precio_base**

**Solución**:
```sql
UPDATE sensors 
SET precio_base = 1000.00 
WHERE precio_base IS NULL OR precio_base = 0;
```

#### 3. **Opciones de cuadro sin precio**

**Solución**:
```sql
UPDATE panel_options 
SET precio_unitario = 500.00 
WHERE precio_unitario IS NULL OR precio_unitario = 0;
```

## Logs útiles para debugging

### En el navegador (F12 → Console)

```javascript
// Ver estado del wizard
console.log(JSON.parse(localStorage.getItem('wizard-storage')));

// Ver sensores cargados
// (aparecen automáticamente cuando abres Step1)

// Ver errores de API
// Filtrar por "Error" en la consola
```

### En el backend

```bash
# Ver logs del servidor API
docker-compose logs -f api

# O si usas npm
cd api
npm run dev
```

## Preguntas Frecuentes

### ¿Por qué el wizard no guarda mi progreso?

El wizard guarda en localStorage automáticamente. Si no funciona:
- Verifica que tu navegador permita localStorage
- Prueba en modo incógnito sin extensiones

### ¿Puedo editar estaciones creadas por el wizard?

Sí, son estaciones normales. Puedes:
- Editarlas en el configurador
- Modificar sensores
- Añadir o quitar POAs
- Cambiar opciones de cuadro

### ¿El wizard soporta múltiples tipos de estación?

Sí, puedes crear:
- Tipo 1: Estación Principal (1 unidad)
- Tipo 2: Estación Auxiliar (3 unidades)
- etc.

Cada tipo se configura independientemente.

### ¿Qué pasa si cierro el wizard antes de terminar?

Tu progreso se guarda en localStorage. Al reabrir:
- Verás tus selecciones previas
- Puedes continuar donde lo dejaste
- Puedes empezar de nuevo si quieres

## Contacto y Soporte

Si el problema persiste:

1. **Revisa la consola** del navegador (F12)
2. **Copia el error** completo
3. **Verifica la BD** con las queries de arriba
4. **Consulta los logs** del servidor
5. **Revisa WIZARD_IMPLEMENTACION.md** para detalles técnicos

## Checklist de Verificación

Antes de usar el wizard, verifica:

- [ ] Hay sensores en la BD con tipos correctos
- [ ] Los sensores tienen `allowed_hotspots_json` configurado
- [ ] Hay hotspots de viento en la BD  
- [ ] Los sensores tienen `precio_base` > 0
- [ ] Hay opciones de cuadro (dataloggers, protecciones)
- [ ] El usuario tiene permisos de creación
- [ ] El proyecto tiene una provincia asignada (o se pedirá en Paso 0)

## Datos de Prueba

Para probar el wizard rápidamente:

```sql
-- Script de datos de prueba (ejecutar en la BD)

-- Hotspots
INSERT INTO hotspots (key, nombre, descripcion) VALUES
  ('H1_mast_top', 'Mástil Superior', 'Parte superior del mástil'),
  ('H1_ghi', 'GHI', 'Radiación horizontal');

-- Sensor multiparamétrico
INSERT INTO sensors (id, brand, model, type, precio_base, allowed_hotspots_json) VALUES
  ('ws600-001', 'Lufft', 'WS600-UMB', 'multiparametrico', 1250.00, '["H1_mast_top"]');

-- Sensor GHI
INSERT INTO sensors (id, brand, model, type, precio_base, allowed_hotspots_json) VALUES
  ('smp10-001', 'Kipp & Zonen', 'SMP10', 'radiacion', 850.00, '["H1_ghi"]');

-- Datalogger
INSERT INTO panel_options (id, nombre, marca, tipo, precio_unitario) VALUES
  ('cr1000x-001', 'CR1000X', 'Campbell Scientific', 'datalogger', 2500.00);
```

¡Con esto el wizard debería funcionar perfectamente! 🎉

