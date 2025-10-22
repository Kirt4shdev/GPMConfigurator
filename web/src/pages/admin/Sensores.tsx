import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

export const AdminSensores = () => {
  const [sensors, setSensors] = useState<any[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadSensors();
  }, []);

  useEffect(() => {
    filterSensors();
  }, [sensors, searchTerm, filterType]);

  const loadSensors = async () => {
    try {
      const data = await api.getSensors();
      setSensors(data);
    } catch (error: any) {
      console.error('Error loading sensors:', error);
      alert('Error al cargar sensores');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSensors = () => {
    let filtered = sensors;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter((s) => s.type === filterType);
    }

    setFilteredSensors(filtered);
  };

  const handleCreate = () => {
    setEditingSensor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sensor: any) => {
    setEditingSensor(sensor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este sensor?')) return;

    try {
      await api.deleteSensor(id);
      await loadSensors();
      alert('Sensor eliminado correctamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      id: formData.get('id') as string,
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      type: formData.get('type') as string,
      montaje_permitido: formData.get('montaje_permitido') as string,
      precio_base: parseFloat(formData.get('precio_base') as string),
      allowed_hotspots: (formData.get('allowed_hotspots') as string)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      cable_pricing: [],
      docs: {
        datasheet_url: formData.get('datasheet_url') as string,
        manual_url: formData.get('manual_url') as string,
      },
      images: {
        icon_url: formData.get('icon_url') as string,
        photo_url: formData.get('photo_url') as string,
      },
      mediciones: [],
    };

    try {
      if (editingSensor) {
        await api.updateSensor(editingSensor.id, data);
        alert('Sensor actualizado correctamente');
      } else {
        await api.createSensor(data);
        alert('Sensor creado correctamente');
      }
      setIsModalOpen(false);
      await loadSensors();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const types = ['viento', 'radiacion', 'temperatura_panel', 'multiparametrico'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Sensores</h2>
          <p className="text-sm text-gray-600">Administra el catálogo de sensores</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Sensor
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="ID, marca o modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Filtrar por tipo</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">Marca</th>
                  <th className="text-left py-3 px-4 font-medium">Modelo</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium">Precio</th>
                  <th className="text-left py-3 px-4 font-medium">Montaje</th>
                  <th className="text-right py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSensors.map((sensor) => (
                  <tr key={sensor.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{sensor.id}</td>
                    <td className="py-3 px-4">{sensor.brand}</td>
                    <td className="py-3 px-4">{sensor.model}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {sensor.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{sensor.precio_base}€</td>
                    <td className="py-3 px-4">{sensor.montaje_permitido}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sensor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(sensor.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingSensor ? 'Editar Sensor' : 'Nuevo Sensor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID *</Label>
                  <Input
                    name="id"
                    required
                    defaultValue={editingSensor?.id || ''}
                    disabled={!!editingSensor}
                  />
                </div>
                <div>
                  <Label>Marca *</Label>
                  <Input
                    name="brand"
                    required
                    defaultValue={editingSensor?.brand || ''}
                  />
                </div>
                <div>
                  <Label>Modelo *</Label>
                  <Input
                    name="model"
                    required
                    defaultValue={editingSensor?.model || ''}
                  />
                </div>
                <div>
                  <Label>Tipo *</Label>
                  <select
                    name="type"
                    required
                    className="w-full h-10 px-3 rounded-md border"
                    defaultValue={editingSensor?.type || ''}
                  >
                    <option value="">Seleccionar...</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Montaje permitido *</Label>
                  <select
                    name="montaje_permitido"
                    required
                    className="w-full h-10 px-3 rounded-md border"
                    defaultValue={editingSensor?.montaje_permitido || ''}
                  >
                    <option value="estacion">Estación</option>
                    <option value="poa">POA</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
                <div>
                  <Label>Precio base (€) *</Label>
                  <Input
                    name="precio_base"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingSensor?.precio_base || ''}
                  />
                </div>
              </div>

              <div>
                <Label>Hotspots permitidos (separados por coma)</Label>
                <Input
                  name="allowed_hotspots"
                  placeholder="ej: H1, H2, H3"
                  defaultValue={editingSensor?.allowed_hotspots_json?.join(', ') || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Datasheet URL</Label>
                  <Input
                    name="datasheet_url"
                    type="url"
                    defaultValue={editingSensor?.docs_json?.datasheet_url || ''}
                  />
                </div>
                <div>
                  <Label>Manual URL</Label>
                  <Input
                    name="manual_url"
                    type="url"
                    defaultValue={editingSensor?.docs_json?.manual_url || ''}
                  />
                </div>
                <div>
                  <Label>Icon URL</Label>
                  <Input
                    name="icon_url"
                    type="url"
                    defaultValue={editingSensor?.images_json?.icon_url || ''}
                  />
                </div>
                <div>
                  <Label>Photo URL</Label>
                  <Input
                    name="photo_url"
                    type="url"
                    defaultValue={editingSensor?.images_json?.photo_url || ''}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSensor ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

