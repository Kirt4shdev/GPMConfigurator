import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

interface POAsTabProps {
  station: any;
  onUpdate: () => void;
}

export const POAsTab = ({ station, onUpdate }: POAsTabProps) => {
  const [poas, setPoas] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPoaName, setNewPoaName] = useState('');
  const [newPoaDistance, setNewPoaDistance] = useState('0');
  const [sensors, setSensors] = useState<any[]>([]);
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);
  const [selectedPoaId, setSelectedPoaId] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState('');
  const [cableLength, setCableLength] = useState('10');

  useEffect(() => {
    loadPOAs();
    loadSensors();
  }, [station.id]);

  const loadPOAs = async () => {
    try {
      const data = await api.getPOAs(station.id);
      setPoas(data);
    } catch (error) {
      console.error('Error loading POAs:', error);
    }
  };

  const loadSensors = async () => {
    try {
      const data = await api.getSensors({ montaje_permitido: 'poa' });
      setSensors(data);
    } catch (error) {
      console.error('Error loading sensors:', error);
    }
  };

  const handleCreatePOA = async () => {
    if (!newPoaName.trim()) return;

    try {
      await api.createPOA({
        station_id: station.id,
        nombre: newPoaName,
        distancia_a_estacion_m: parseFloat(newPoaDistance) || 0,
      });
      setNewPoaName('');
      setNewPoaDistance('0');
      setShowCreateForm(false);
      loadPOAs();
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeletePOA = async (poaId: string) => {
    if (!confirm('¿Eliminar este POA?')) return;

    try {
      await api.deletePOA(poaId);
      loadPOAs();
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleOpenAddSensor = (poaId: string) => {
    setSelectedPoaId(poaId);
    setShowAddSensorModal(true);
  };

  const handleAddSensorToPOA = async () => {
    if (!selectedPoaId || !selectedSensor) {
      alert('Por favor selecciona un sensor');
      return;
    }

    try {
      await api.addPOASensor(selectedPoaId, {
        sensor_id: selectedSensor,
        metros_cable: parseFloat(cableLength) || 10,
      });
      setShowAddSensorModal(false);
      setSelectedPoaId(null);
      setSelectedSensor('');
      setCableLength('10');
      loadPOAs();
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRemoveSensorFromPOA = async (poaId: string, sensorId: string) => {
    if (!confirm('¿Eliminar este sensor del POA?')) return;

    try {
      await api.deletePOASensor(poaId, sensorId);
      loadPOAs();
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">POAs (Plane of Array)</h4>
        <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Nuevo
        </Button>
      </div>

      {showCreateForm && (
        <div className="border rounded-lg p-3 space-y-3">
          <div>
            <Label htmlFor="poa-name">Nombre</Label>
            <Input
              id="poa-name"
              value={newPoaName}
              onChange={(e) => setNewPoaName(e.target.value)}
              placeholder="POA 1"
            />
          </div>
          <div>
            <Label htmlFor="poa-distance">Distancia (m)</Label>
            <Input
              id="poa-distance"
              type="number"
              value={newPoaDistance}
              onChange={(e) => setNewPoaDistance(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreatePOA}>
              Crear
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {poas.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay POAs configurados</p>
      ) : (
        <div className="space-y-2">
          {poas.map((poa) => (
            <div key={poa.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{poa.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    Distancia: {poa.distancia_a_estacion_m} m
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeletePOA(poa.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Sensores:</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenAddSensor(poa.id)}
                    className="h-6 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Añadir
                  </Button>
                </div>

                {poa.sensors && poa.sensors.length > 0 ? (
                  <div className="space-y-1">
                    {poa.sensors.filter((s: any) => s.sensor).map((poaSensor: any) => (
                      <div key={poaSensor.id} className="bg-slate-50 rounded p-2 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium">
                            {poaSensor.sensor.brand} {poaSensor.sensor.model}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cable: {poaSensor.metros_cable}m
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSensorFromPOA(poa.id, poaSensor.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Sin sensores</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Añadir Sensor a POA */}
      {showAddSensorModal && selectedPoaId && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddSensorModal(false);
              setSelectedPoaId(null);
            }
          }}
        >
          <Card className="max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">
              Añadir Sensor a {poas.find(p => p.id === selectedPoaId)?.nombre}
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="poa-sensor">Sensor *</Label>
                <select
                  id="poa-sensor"
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
                <p className="text-xs text-muted-foreground mt-1">
                  Solo sensores compatibles con POAs
                </p>
              </div>

              <div>
                <Label htmlFor="poa-cable">Metros de cable</Label>
                <Input
                  id="poa-cable"
                  type="number"
                  value={cableLength}
                  onChange={(e) => setCableLength(e.target.value)}
                  min="0"
                  step="1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddSensorToPOA} className="flex-1">
                  Añadir Sensor
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddSensorModal(false);
                    setSelectedPoaId(null);
                  }}
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

