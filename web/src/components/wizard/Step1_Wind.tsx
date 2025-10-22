import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { api } from '@/lib/api';
import { Check, Loader2, Wind, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Sensor {
  id: string;
  brand: string;
  model: string;
  type: string;
  precio_base: number;
  allowed_hotspots_json?: string;
  recomendado?: boolean;
}

interface WindSelection {
  sensor_id: string;
  hotspot_key: string;
  metros_cable: number;
}

interface Step1Props {
  tipoNombre: string;
  initialData?: {
    tipo: 'multiparametrico' | 'analogico';
    selections: WindSelection[];
  };
  onComplete: (data: { tipo: 'multiparametrico' | 'analogico'; selections: WindSelection[] }) => void;
  onBack: () => void;
}

export const Step1_Wind = ({ tipoNombre, initialData, onComplete, onBack }: Step1Props) => {
  const [windType, setWindType] = useState<'multiparametrico' | 'analogico' | null>(
    initialData?.tipo || null
  );
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [allSensors, setAllSensors] = useState<Sensor[]>([]); // Todos los sensores sin filtrar
  const [loading, setLoading] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState<WindSelection[]>(
    initialData?.selections || []
  );
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (windType && allSensors.length > 0) {
      filterSensors();
    }
  }, [windType, allSensors, hotspots]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar hotspots y todos los sensores en paralelo
      const [hotspotsData, sensorsData] = await Promise.all([
        api.getHotspots(),
        api.getSensors(),
      ]);

      console.log('Hotspots loaded:', hotspotsData.length);
      console.log('All sensors loaded:', sensorsData.length);
      
      // Filtrar hotspots de viento
      const windHotspots = hotspotsData.filter(
        (h: any) => h.key.includes('mast') || h.key.includes('viento') || h.key.includes('wind')
      );
      setHotspots(windHotspots);
      
      // Guardar todos los sensores
      setAllSensors(sensorsData);

      // Si ya había un tipo seleccionado, filtrar sensores
      if (initialData?.tipo) {
        filterSensorsByType(sensorsData, initialData.tipo, windHotspots);
      }
    } catch (error: any) {
      console.error('Error loading initial data:', error);
      setError(error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filterSensors = () => {
    if (!windType) return;
    filterSensorsByType(allSensors, windType, hotspots);
  };

  const filterSensorsByType = (sensorsData: Sensor[], type: 'multiparametrico' | 'analogico', windHotspots: any[]) => {
    console.log(`Filtering sensors for type: ${type}`);
    
    // Mapear tipos de wizard a tipos de BD
    const typeMap: Record<string, string[]> = {
      multiparametrico: ['multiparametrico', 'viento_multiparametrico', 'estacion_meteorologica'],
      analogico: ['viento', 'anemometro', 'veleta', 'viento_analogico'],
    };

    const validTypes = typeMap[type] || [type];
    console.log('Valid types for search:', validTypes);

    // Filtrar por tipo
    let filtered = sensorsData.filter((s) => 
      validTypes.some(vt => s.type?.toLowerCase().includes(vt.toLowerCase()))
    );
    console.log(`Sensors after type filter:`, filtered.length);

    // Filtrar por hotspots permitidos
    const windHotspotKeys = windHotspots.map((h) => h.key);
    if (windHotspotKeys.length > 0) {
      filtered = filtered.filter((s) => {
        try {
          const allowedHotspots = s.allowed_hotspots_json 
            ? JSON.parse(s.allowed_hotspots_json)
            : [];
          return allowedHotspots.length === 0 || 
                 allowedHotspots.some((h: string) => windHotspotKeys.includes(h));
        } catch {
          return true; // Si hay error parseando, incluir el sensor
        }
      });
    }
    console.log(`Sensors after hotspot filter:`, filtered.length);

    // Marcar recomendados
    filtered = filtered.map((s) => ({
      ...s,
      recomendado:
        type === 'multiparametrico' &&
        (s.model.toLowerCase().includes('ws600') ||
         s.model.toLowerCase().includes('ws601') ||
         s.model.toLowerCase().includes('atmos')),
    }));

    setSensors(filtered);

    // Auto-seleccionar recomendado si no hay selección previa
    if (type === 'multiparametrico' && selectedSensors.length === 0) {
      const recommended = filtered.find((s) => s.recomendado);
      if (recommended && windHotspots.length > 0) {
        const firstHotspot = windHotspots[0].key;
        setSelectedSensors([
          {
            sensor_id: recommended.id,
            hotspot_key: firstHotspot,
            metros_cable: 15,
          },
        ]);
      }
    }
  };

  const toggleSensor = (sensor: Sensor) => {
    const isSelected = selectedSensors.some((s) => s.sensor_id === sensor.id);
    
    if (isSelected) {
      setSelectedSensors(selectedSensors.filter((s) => s.sensor_id !== sensor.id));
      return;
    }

    // Obtener hotspots permitidos del sensor
    let allowedHotspots: string[] = [];
    try {
      allowedHotspots = sensor.allowed_hotspots_json 
        ? JSON.parse(sensor.allowed_hotspots_json)
        : [];
    } catch (e) {
      console.error('Error parsing allowed_hotspots:', e);
    }

    // Encontrar el primer hotspot compatible
    const compatibleHotspot = hotspots.find((h) =>
      allowedHotspots.length === 0 || allowedHotspots.includes(h.key)
    );

    const newSelection: WindSelection = {
      sensor_id: sensor.id,
      hotspot_key: compatibleHotspot?.key || hotspots[0]?.key || 'H1_mast_top',
      metros_cable: 15,
    };

    if (windType === 'multiparametrico') {
      // Solo uno permitido
      setSelectedSensors([newSelection]);
    } else {
      // Múltiples permitidos
      setSelectedSensors([...selectedSensors, newSelection]);
    }
  };

  const updateCableLength = (sensorId: string, metros: number) => {
    setSelectedSensors(
      selectedSensors.map((s) =>
        s.sensor_id === sensorId ? { ...s, metros_cable: metros } : s
      )
    );
  };

  const isValid = () => {
    return windType !== null && selectedSensors.length > 0;
  };

  const handleContinue = () => {
    if (!isValid() || !windType) return;
    onComplete({ tipo: windType, selections: selectedSensors });
  };

  const handleTypeSelect = (type: 'multiparametrico' | 'analogico') => {
    setWindType(type);
    setSelectedSensors([]); // Limpiar selecciones anteriores al cambiar tipo
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Sensores de Viento - {tipoNombre}</h3>
        <p className="text-sm text-muted-foreground">
          Seleccione el tipo de medición de viento y los sensores correspondientes
        </p>
      </div>

      {/* Error general */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">Error</p>
              <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selector de tipo */}
      {windType === null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleTypeSelect('multiparametrico')}
            disabled={loading}
            className={cn(
              'relative p-6 rounded-lg border-2 text-left transition-all',
              'hover:border-primary hover:shadow-md',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">Multiparamétrico</h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Recomendado
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sensor todo-en-uno que mide velocidad, dirección, temperatura, presión y más.
                  Más preciso y fácil de instalar.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ej: Lufft WS600, Campbell ATMOS41
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleTypeSelect('analogico')}
            disabled={loading}
            className={cn(
              'relative p-6 rounded-lg border-2 text-left transition-all',
              'hover:border-primary hover:shadow-md',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <Wind className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Analógico</h4>
                <p className="text-sm text-muted-foreground">
                  Sensores individuales: anemómetro para velocidad y veleta para dirección.
                  Mayor flexibilidad, requiere más cableado.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ej: Thies 4.3351, NRG #40C
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Listado de sensores */}
      {windType !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Sensores Disponibles</Label>
            <Button variant="ghost" size="sm" onClick={() => setWindType(null)}>
              Cambiar tipo
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sensors.length === 0 ? (
            <div className="p-6 rounded-lg border bg-muted/30 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                No hay sensores disponibles de tipo <strong>{windType}</strong>
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Total de sensores en BD: {allSensors.length}
              </p>
              <details className="text-left text-xs space-y-1 mt-4 p-3 bg-muted rounded">
                <summary className="cursor-pointer font-medium">Ver tipos disponibles en BD</summary>
                <ul className="mt-2 space-y-1">
                  {Array.from(new Set(allSensors.map(s => s.type))).map(type => (
                    <li key={type}>• {type}</li>
                  ))}
                </ul>
              </details>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWindType(null)}
                className="mt-4"
              >
                Volver a elegir tipo
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {sensors.map((sensor) => {
                const isSelected = selectedSensors.some((s) => s.sensor_id === sensor.id);
                const selection = selectedSensors.find((s) => s.sensor_id === sensor.id);

                return (
                  <div
                    key={sensor.id}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleSensor(sensor)}
                        className={cn(
                          'mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/50 hover:border-primary'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{sensor.model}</h4>
                          {sensor.recomendado && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sensor.brand} • {sensor.type} • €{parseFloat(sensor.precio_base as any)?.toFixed(2) || '0.00'}
                        </p>
                        {isSelected && selection && (
                          <div className="mt-3 flex items-center gap-3">
                            <Label htmlFor={`cable-${sensor.id}`} className="text-xs">
                              Metros de cable:
                            </Label>
                            <Input
                              id={`cable-${sensor.id}`}
                              type="number"
                              min="1"
                              max="200"
                              value={selection.metros_cable}
                              onChange={(e) =>
                                updateCableLength(sensor.id, parseInt(e.target.value) || 1)
                              }
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Anterior
        </Button>
        <Button onClick={handleContinue} disabled={!isValid()}>
          Continuar a POAs
        </Button>
      </div>
    </div>
  );
};

