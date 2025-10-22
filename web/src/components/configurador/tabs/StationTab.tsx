import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

interface StationTabProps {
  station: any;
  onUpdate: () => void;
}

export const StationTab = ({ station, onUpdate }: StationTabProps) => {
  const [sensors, setSensors] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState('');
  const [selectedHotspot, setSelectedHotspot] = useState('');
  const [cableLength, setCableLength] = useState('10');

  useEffect(() => {
    loadSensors();
    loadHotspots();
  }, []);

  const loadSensors = async () => {
    try {
      const data = await api.getSensors({ montaje_permitido: 'estacion' });
      setSensors(data);
    } catch (error) {
      console.error('Error loading sensors:', error);
    }
  };

  const loadHotspots = async () => {
    try {
      const data = await api.getHotspots();
      setHotspots(data);
    } catch (error) {
      console.error('Error loading hotspots:', error);
    }
  };

  const handleRemoveSelection = async (selectionId: string) => {
    if (!confirm('¿Eliminar este sensor?')) return;

    try {
      await api.deleteStationSelection(station.id, selectionId);
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddSensor = async () => {
    if (!selectedSensor || !selectedHotspot) {
      alert('Por favor selecciona un sensor y una ubicación');
      return;
    }

    try {
      await api.addStationSelection(station.id, {
        sensor_id: selectedSensor,
        hotspot_key: selectedHotspot,
        metros_cable: parseFloat(cableLength) || 10,
      });
      setShowAddModal(false);
      setSelectedSensor('');
      setSelectedHotspot('');
      setCableLength('10');
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const calculateSensorTotal = (selection: any) => {
    const basePrice = parseFloat(selection.precio_base) || 0;
    const cablePrice = calculateCablePrice(selection.cable_pricing_json, selection.metros_cable);
    return basePrice + cablePrice;
  };

  const calculateCablePrice = (cablePricing: any[], metros: number) => {
    if (!cablePricing || cablePricing.length === 0) return 0;

    let total = 0;
    const sortedTiers = [...cablePricing].sort((a, b) => a.min_m - b.min_m);

    for (const tier of sortedTiers) {
      if (metros > tier.min_m) {
        const metersInTier = Math.min(metros, tier.max_m) - tier.min_m;
        if (metersInTier > 0) {
          total += tier.precio;
        }
      }
    }

    return total;
  };

  const selections = station.selections || [];
  const totalSensors = selections.reduce((sum: number, sel: any) => sum + calculateSensorTotal(sel), 0);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-1">{station.name}</h3>
        <p className="text-sm text-muted-foreground">{station.provincia}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Sensores instalados</h4>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Añadir
          </Button>
        </div>

        {selections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay sensores configurados</p>
        ) : (
          <div className="space-y-2">
            {selections.map((selection: any) => (
              <div key={selection.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {selection.brand} {selection.model}
                    </p>
                    <p className="text-xs text-muted-foreground">{selection.hotspot_key}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSelection(selection.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base:</span>
                    <span>{parseFloat(selection.precio_base).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Cable ({selection.metros_cable}m):
                    </span>
                    <span>
                      {calculateCablePrice(
                        selection.cable_pricing_json,
                        selection.metros_cable
                      ).toFixed(2)}{' '}
                      €
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Total:</span>
                    <span>{calculateSensorTotal(selection).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>Subtotal Sensores:</span>
                <span>{totalSensors.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Añadir Sensor */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <Card className="max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Añadir Sensor a Estación</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sensor">Sensor *</Label>
                <select
                  id="sensor"
                  value={selectedSensor}
                  onChange={(e) => setSelectedSensor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Selecciona un sensor</option>
                  {sensors.map((sensor) => (
                    <option key={sensor.id} value={sensor.id}>
                      {sensor.brand} {sensor.model} - {sensor.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="hotspot">Ubicación *</Label>
                <select
                  id="hotspot"
                  value={selectedHotspot}
                  onChange={(e) => setSelectedHotspot(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Selecciona una ubicación</option>
                  {hotspots.map((hotspot) => (
                    <option key={hotspot.key} value={hotspot.key}>
                      {hotspot.label || hotspot.key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="cable">Metros de cable</Label>
                <Input
                  id="cable"
                  type="number"
                  value={cableLength}
                  onChange={(e) => setCableLength(e.target.value)}
                  min="0"
                  step="1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddSensor} className="flex-1">
                  Añadir Sensor
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

