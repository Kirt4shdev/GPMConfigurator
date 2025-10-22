import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { SvgHotspotCanvas } from './SvgHotspotCanvas';
import esquemaUrl from '@/assets/infografia_Renovables_centered.svg';

interface SVGViewerProps {
  station: any;
  onUpdate: () => void;
}

interface Hotspot {
  key: string;
  x: number;
  y: number;
  label?: string;
}

export const SVGViewer = ({ station, onUpdate }: SVGViewerProps) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [showSensorSelector, setShowSensorSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [station.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadHotspots(), loadSensors()]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHotspots = async () => {
    try {
      // Usar hotspot_map de la estación si existe, sino cargar todos los hotspots
      if (station.hotspot_map && Array.isArray(station.hotspot_map) && station.hotspot_map.length > 0) {
        console.log('✓ Usando hotspots de la estación:', station.hotspot_map);
        setHotspots(station.hotspot_map);
      } else {
        console.log('⚠ No hay hotspot_map en estación, cargando hotspots globales...');
        const data = await api.getHotspots();
        console.log('✓ Hotspots globales cargados:', data);
        setHotspots(data);
      }
    } catch (error) {
      console.error('❌ Error loading hotspots:', error);
      setHotspots([]);
    }
  };

  const loadSensors = async () => {
    try {
      const data = await api.getSensors({ montaje_permitido: 'estacion' });
      setSensors(data);
    } catch (error) {
      console.error('Error loading sensors:', error);
      setSensors([]);
    }
  };

  const handleHotspotClick = (hotspotKey: string) => {
    setSelectedHotspot(hotspotKey);
    setShowSensorSelector(true);
  };

  const handleSelectSensor = async (sensorId: string) => {
    if (!selectedHotspot) return;

    try {
      // Eliminar selección previa en este hotspot si existe
      const existingSelection = station.selections?.find(
        (s: any) => s.hotspot_key === selectedHotspot
      );
      if (existingSelection) {
        await api.deleteStationSelection(station.id, existingSelection.id);
      }

      // Agregar nueva selección
      await api.addStationSelection(station.id, {
        sensor_id: sensorId,
        hotspot_key: selectedHotspot,
        metros_cable: 10,
      });

      setShowSensorSelector(false);
      setSelectedHotspot(null);
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const getAvailableSensorsForHotspot = (hotspotKey: string) => {
    return sensors.filter((sensor) => {
      // Si el sensor tiene allowed_hotspots_json, verificar que incluya este hotspot
      if (sensor.allowed_hotspots_json) {
        try {
          const allowed = Array.isArray(sensor.allowed_hotspots_json)
            ? sensor.allowed_hotspots_json
            : JSON.parse(sensor.allowed_hotspots_json);
          return allowed.includes(hotspotKey);
        } catch {
          return false;
        }
      }
      // Si no tiene restricciones, está disponible para todos
      return true;
    });
  };

  const getCurrentSensorForHotspot = (hotspotKey: string) => {
    return station.selections?.find((s: any) => s.hotspot_key === hotspotKey);
  };

  const handleRemoveCurrentSensor = async () => {
    if (!selectedHotspot) return;
    
    const currentSensor = getCurrentSensorForHotspot(selectedHotspot);
    if (!currentSensor) return;

    if (!confirm('¿Deseas eliminar este sensor?')) return;

    try {
      await api.deleteStationSelection(station.id, currentSensor.id);
      setShowSensorSelector(false);
      setSelectedHotspot(null);
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando esquema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Canvas con SVG y Hotspots */}
      <SvgHotspotCanvas
        svgUrl={esquemaUrl}
        hotspots={hotspots}
        onHotspotClick={handleHotspotClick}
        selections={station.selections || []}
      />

      {/* Sensor Selector Modal */}
      {showSensorSelector && selectedHotspot && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSensorSelector(false);
              setSelectedHotspot(null);
            }
          }}
        >
          <Card className="max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-slate-100">
              <h3 className="text-xl font-semibold text-slate-900">
                {getCurrentSensorForHotspot(selectedHotspot) ? 'Cambiar sensor' : 'Seleccionar sensor'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Posición:{' '}
                <span className="font-medium">
                  {hotspots.find((h) => h.key === selectedHotspot)?.label || selectedHotspot}
                </span>
              </p>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Sensor Actual (si existe) */}
              {(() => {
                const currentSensor = getCurrentSensorForHotspot(selectedHotspot);
                if (currentSensor) {
                  return (
                    <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-green-700 uppercase">
                          Sensor Actual
                        </span>
                        <button
                          onClick={handleRemoveCurrentSensor}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {currentSensor.brand} {currentSensor.model}
                          </p>
                          <p className="text-sm text-slate-600 mt-0.5">{currentSensor.type}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Cable: {currentSensor.metros_cable}m
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-slate-900">
                            {parseFloat(currentSensor.precio_base || 0).toFixed(2)} €
                          </p>
                          <p className="text-xs text-slate-500">Base</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Lista de sensores disponibles */}
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                {getCurrentSensorForHotspot(selectedHotspot) ? 'Cambiar por:' : 'Sensores disponibles:'}
              </h4>

              {getAvailableSensorsForHotspot(selectedHotspot).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay sensores disponibles para esta posición
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {getAvailableSensorsForHotspot(selectedHotspot).map((sensor) => {
                    const isCurrent = getCurrentSensorForHotspot(selectedHotspot)?.sensor_id === sensor.id;
                    return (
                      <button
                        key={sensor.id}
                        onClick={() => handleSelectSensor(sensor.id)}
                        disabled={isCurrent}
                        className={`
                          w-full text-left p-4 border-2 rounded-xl transition-all duration-200 group
                          ${isCurrent 
                            ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-60' 
                            : 'hover:border-sky-400 hover:bg-sky-50/50'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className={`font-semibold transition-colors ${isCurrent ? 'text-green-700' : 'text-slate-900 group-hover:text-sky-700'}`}>
                              {sensor.brand || 'N/A'} {sensor.model || 'N/A'}
                            </p>
                            <p className="text-sm text-slate-600 mt-0.5">{sensor.type || 'N/A'}</p>
                            {sensor.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {sensor.description}
                              </p>
                            )}
                            {isCurrent && (
                              <span className="inline-block mt-2 text-xs font-medium text-green-700">
                                ✓ Seleccionado
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-slate-900">
                              {(typeof sensor.precio_base === 'number' ? sensor.precio_base : parseFloat(sensor.precio_base || 0)).toFixed(2)} €
                            </p>
                            <p className="text-xs text-slate-500">Base</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-slate-50">
              <button
                onClick={() => {
                  setShowSensorSelector(false);
                  setSelectedHotspot(null);
                }}
                className="w-full px-4 py-2.5 border-2 rounded-lg hover:bg-white transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

