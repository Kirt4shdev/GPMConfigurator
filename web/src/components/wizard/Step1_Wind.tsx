import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { api } from '@/lib/api';
import { Check, Loader2, Wind, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Sensor {
  id: string;
  nombre: string;
  marca: string;
  tipo: string;
  precio_unitario: number;
  allowed_hotspots: string[];
  recomendado?: boolean;
}

interface WindSelection {
  sensor_id: string;
  hotspot_key: string;
  metros_cable: number;
}

interface Step1Props {
  tipoNombre: string;
  onComplete: (data: { tipo: 'multiparametrico' | 'analogico'; selections: WindSelection[] }) => void;
  onBack: () => void;
}

export const Step1_Wind = ({ tipoNombre, onComplete, onBack }: Step1Props) => {
  const [windType, setWindType] = useState<'multiparametrico' | 'analogico' | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState<WindSelection[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);

  useEffect(() => {
    loadHotspots();
  }, []);

  useEffect(() => {
    if (windType) {
      loadSensors();
    }
  }, [windType]);

  const loadHotspots = async () => {
    try {
      const data = await api.getHotspots();
      setHotspots(data.filter((h: any) => h.key.includes('mast') || h.key.includes('viento')));
    } catch (error) {
      console.error('Error loading hotspots:', error);
    }
  };

  const loadSensors = async () => {
    setLoading(true);
    try {
      let data: Sensor[];
      if (windType === 'multiparametrico') {
        data = await api.getSensors({ type: 'multiparametrico' });
        // Marcar WS600 como recomendado si existe
        data = data.map((s) => ({
          ...s,
          recomendado: s.nombre.toLowerCase().includes('ws600') || 
                       s.nombre.toLowerCase().includes('ws601'),
        }));
      } else {
        data = await api.getSensors({ type: 'viento' });
      }
      
      // Filtrar por hotspots de viento
      const windHotspotKeys = hotspots.map((h) => h.key);
      const filtered = data.filter((s) =>
        s.allowed_hotspots?.some((h) => windHotspotKeys.includes(h))
      );
      
      setSensors(filtered);

      // Auto-seleccionar el recomendado si hay uno
      if (windType === 'multiparametrico') {
        const recommended = filtered.find((s) => s.recomendado);
        if (recommended && hotspots.length > 0) {
          const firstHotspot = hotspots[0].key;
          setSelectedSensors([
            {
              sensor_id: recommended.id,
              hotspot_key: firstHotspot,
              metros_cable: 15,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading sensors:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSensor = (sensor: Sensor) => {
    if (windType === 'multiparametrico') {
      // Solo uno
      const isSelected = selectedSensors.some((s) => s.sensor_id === sensor.id);
      if (isSelected) {
        setSelectedSensors([]);
      } else {
        const hotspot = hotspots.find((h) =>
          sensor.allowed_hotspots?.includes(h.key)
        );
        setSelectedSensors([
          {
            sensor_id: sensor.id,
            hotspot_key: hotspot?.key || hotspots[0]?.key || '',
            metros_cable: 15,
          },
        ]);
      }
    } else {
      // Múltiples (anemómetro, veleta)
      const isSelected = selectedSensors.some((s) => s.sensor_id === sensor.id);
      if (isSelected) {
        setSelectedSensors(selectedSensors.filter((s) => s.sensor_id !== sensor.id));
      } else {
        const hotspot = hotspots.find((h) =>
          sensor.allowed_hotspots?.includes(h.key)
        );
        setSelectedSensors([
          ...selectedSensors,
          {
            sensor_id: sensor.id,
            hotspot_key: hotspot?.key || hotspots[0]?.key || '',
            metros_cable: 15,
          },
        ]);
      }
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Sensores de Viento - {tipoNombre}</h3>
        <p className="text-sm text-muted-foreground">
          Seleccione el tipo de medición de viento y los sensores correspondientes
        </p>
      </div>

      {/* Selector de tipo */}
      {windType === null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setWindType('multiparametrico')}
            className={cn(
              'relative p-6 rounded-lg border-2 text-left transition-all',
              'hover:border-primary hover:shadow-md',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
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
            onClick={() => setWindType('analogico')}
            className={cn(
              'relative p-6 rounded-lg border-2 text-left transition-all',
              'hover:border-primary hover:shadow-md',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
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
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay sensores disponibles de tipo {windType}</p>
              <p className="text-xs mt-2">Puede añadirlos desde el Panel de Administración</p>
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
                          <h4 className="font-medium">{sensor.nombre}</h4>
                          {sensor.recomendado && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sensor.marca} • {sensor.tipo} • €{sensor.precio_unitario.toFixed(2)}
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

