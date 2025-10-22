import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { api } from '@/lib/api';
import { Check, Loader2, Sun, Thermometer, Droplets } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Sensor {
  id: string;
  nombre: string;
  marca: string;
  tipo: string;
  precio_unitario: number;
  allowed_hotspots?: string[];
}

interface POAConfig {
  temperaturaPanel: boolean;
  numSensoresTemp: number;
  radiacionInclinada: boolean;
  ensuciamiento: boolean;
  sensoresTemp: Array<{ sensor_id: string; metros_cable: number }>;
  sensoresRadiacion: Array<{ sensor_id: string; metros_cable: number }>;
  sensoresEnsuciamiento: Array<{ sensor_id: string; metros_cable: number }>;
}

interface RadiationSelection {
  sensor_id: string;
  hotspot_key: string;
  metros_cable: number;
}

interface Step3Props {
  tipoNombre: string;
  poas: Array<{ nombre: string; distancia_m: number }>;
  initialData?: {
    radiacionHorizontal: boolean;
    sensorRadiacionHorizontal?: RadiationSelection;
    poasConfig: POAConfig[];
  };
  onComplete: (data: {
    radiacionHorizontal: boolean;
    sensorRadiacionHorizontal?: RadiationSelection;
    poasConfig: POAConfig[];
  }) => void;
  onBack: () => void;
}

export const Step3_Radiation = ({ tipoNombre, poas, initialData, onComplete, onBack }: Step3Props) => {
  const [loading, setLoading] = useState(false);
  
  // Radiación horizontal
  const [radiacionHorizontal, setRadiacionHorizontal] = useState(
    initialData?.radiacionHorizontal ?? true
  );
  const [sensoresGHI, setSensoresGHI] = useState<Sensor[]>([]);
  const [selectedGHI, setSelectedGHI] = useState<RadiationSelection | null>(
    initialData?.sensorRadiacionHorizontal || null
  );
  
  // Sensores para POAs
  const [sensoresTemp, setSensoresTemp] = useState<Sensor[]>([]);
  const [sensoresRadiacion, setSensoresRadiacion] = useState<Sensor[]>([]);
  const [sensoresEnsuciamiento, setSensoresEnsuciamiento] = useState<Sensor[]>([]);
  
  // Config por POA
  const [poasConfig, setPOAsConfig] = useState<POAConfig[]>(
    initialData?.poasConfig && initialData.poasConfig.length > 0
      ? initialData.poasConfig
      : poas.map(() => ({
          temperaturaPanel: true,
          numSensoresTemp: 1,
          radiacionInclinada: true,
          ensuciamiento: false,
          sensoresTemp: [],
          sensoresRadiacion: [],
          sensoresEnsuciamiento: [],
        }))
  );

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    setLoading(true);
    try {
      const [ghi, temp, rad, soiling] = await Promise.all([
        api.getSensors({ type: 'radiacion' }),
        api.getSensors({ type: 'temperatura_panel' }),
        api.getSensors({ type: 'radiacion' }),
        api.getSensors({ type: 'soiling' }).catch(() => []),
      ]);

      setSensoresGHI(ghi.filter((s: Sensor) => 
        s.nombre.toLowerCase().includes('ghi') || 
        s.nombre.toLowerCase().includes('horizontal')
      ));
      setSensoresTemp(temp);
      setSensoresRadiacion(rad.filter((s: Sensor) => 
        !s.nombre.toLowerCase().includes('ghi') &&
        !s.nombre.toLowerCase().includes('horizontal')
      ));
      setSensoresEnsuciamiento(soiling);

      // Auto-seleccionar GHI recomendado
      const recommended = ghi.find((s: Sensor) => 
        s.nombre.toLowerCase().includes('smp10') ||
        s.nombre.toLowerCase().includes('ghi')
      );
      if (recommended && radiacionHorizontal) {
        setSelectedGHI({
          sensor_id: recommended.id,
          hotspot_key: 'H1_ghi',
          metros_cable: 10,
        });
      }
    } catch (error) {
      console.error('Error loading sensors:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePOAConfig = (index: number, updates: Partial<POAConfig>) => {
    const updated = [...poasConfig];
    updated[index] = { ...updated[index], ...updates };
    setPOAsConfig(updated);
  };

  const addSensorToPOA = (poaIndex: number, type: 'temp' | 'radiacion' | 'ensuciamiento', sensorId: string) => {
    const updated = [...poasConfig];
    const distancia = poas[poaIndex].distancia_m;
    
    if (type === 'temp') {
      updated[poaIndex].sensoresTemp = [
        ...updated[poaIndex].sensoresTemp,
        { sensor_id: sensorId, metros_cable: distancia },
      ];
    } else if (type === 'radiacion') {
      updated[poaIndex].sensoresRadiacion = [
        { sensor_id: sensorId, metros_cable: distancia },
      ];
    } else if (type === 'ensuciamiento') {
      updated[poaIndex].sensoresEnsuciamiento = [
        { sensor_id: sensorId, metros_cable: distancia },
      ];
    }
    
    setPOAsConfig(updated);
  };

  const isValid = () => {
    if (radiacionHorizontal && !selectedGHI) return false;
    
    for (let i = 0; i < poasConfig.length; i++) {
      const config = poasConfig[i];
      if (config.temperaturaPanel && config.sensoresTemp.length === 0) return false;
      if (config.radiacionInclinada && config.sensoresRadiacion.length === 0) return false;
    }
    
    return true;
  };

  const handleContinue = () => {
    if (!isValid()) return;
    onComplete({
      radiacionHorizontal,
      sensorRadiacionHorizontal: selectedGHI || undefined,
      poasConfig,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Radiación y Temperatura - {tipoNombre}</h3>
        <p className="text-sm text-muted-foreground">
          Configure sensores de radiación y temperatura para la estación y sus POAs
        </p>
      </div>

      {/* Radiación horizontal */}
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <Sun className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Radiación Solar Horizontal (GHI)</h4>
            <p className="text-sm text-muted-foreground">Medición en la estación principal</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={radiacionHorizontal}
              onChange={(e) => setRadiacionHorizontal(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium">Incluir</span>
          </label>
        </div>

        {radiacionHorizontal && sensoresGHI.length > 0 && (
          <div className="space-y-2 pt-2">
            <Label>Sensor GHI Recomendado</Label>
            {sensoresGHI.slice(0, 3).map((sensor) => (
              <button
                key={sensor.id}
                onClick={() =>
                  setSelectedGHI({
                    sensor_id: sensor.id,
                    hotspot_key: 'H1_ghi',
                    metros_cable: 10,
                  })
                }
                className={cn(
                  'w-full p-3 rounded-lg border-2 text-left transition-all',
                  selectedGHI?.sensor_id === sensor.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      selectedGHI?.sensor_id === sensor.id
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/50'
                    )}
                  >
                    {selectedGHI?.sensor_id === sensor.id && (
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{sensor.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {sensor.marca} • €{sensor.precio_unitario.toFixed(2)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* POAs */}
      {poas.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Configuración por POA</h4>
          {poas.map((poa, index) => {
            const config = poasConfig[index];
            return (
              <div key={index} className="p-4 rounded-lg border bg-card space-y-4">
                <h5 className="font-medium">{poa.nombre}</h5>

                {/* Temperatura */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <Label className="flex-1">Temperatura de Panel</Label>
                    <input
                      type="checkbox"
                      checked={config.temperaturaPanel}
                      onChange={(e) =>
                        updatePOAConfig(index, { temperaturaPanel: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                  </div>
                  {config.temperaturaPanel && (
                    <div className="ml-7 space-y-2">
                      <div className="flex items-center gap-3">
                        <Label className="text-xs">Cantidad:</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={config.numSensoresTemp}
                          onChange={(e) =>
                            updatePOAConfig(index, {
                              numSensoresTemp: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-20 h-8 text-sm"
                        />
                      </div>
                      {sensoresTemp.length > 0 && config.sensoresTemp.length === 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const sensor = sensoresTemp[0];
                            for (let i = 0; i < config.numSensoresTemp; i++) {
                              addSensorToPOA(index, 'temp', sensor.id);
                            }
                          }}
                        >
                          Auto-seleccionar {config.numSensoresTemp} sensor(es)
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Radiación inclinada */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <Label className="flex-1">Radiación Inclinada (POA)</Label>
                    <input
                      type="checkbox"
                      checked={config.radiacionInclinada}
                      onChange={(e) =>
                        updatePOAConfig(index, { radiacionInclinada: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                  </div>
                  {config.radiacionInclinada &&
                    sensoresRadiacion.length > 0 &&
                    config.sensoresRadiacion.length === 0 && (
                      <div className="ml-7">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addSensorToPOA(index, 'radiacion', sensoresRadiacion[0].id)}
                        >
                          Auto-seleccionar sensor
                        </Button>
                      </div>
                    )}
                </div>

                {/* Ensuciamiento */}
                {sensoresEnsuciamiento.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <Label className="flex-1">Sensor de Ensuciamiento</Label>
                      <input
                        type="checkbox"
                        checked={config.ensuciamiento}
                        onChange={(e) =>
                          updatePOAConfig(index, { ensuciamiento: e.target.checked })
                        }
                        className="w-4 h-4 rounded"
                      />
                    </div>
                    {config.ensuciamiento && config.sensoresEnsuciamiento.length === 0 && (
                      <div className="ml-7">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            addSensorToPOA(index, 'ensuciamiento', sensoresEnsuciamiento[0].id)
                          }
                        >
                          Auto-seleccionar sensor
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Anterior
        </Button>
        <Button onClick={handleContinue} disabled={!isValid()}>
          Continuar a Cuadro Eléctrico
        </Button>
      </div>
    </div>
  );
};

