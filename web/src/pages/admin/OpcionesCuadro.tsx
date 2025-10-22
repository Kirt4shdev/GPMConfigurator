import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export const AdminOpcionesCuadro = () => {
  const [options, setOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<any>(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const data = await api.getPanelOptions();
      setOptions(data);
    } catch (error: any) {
      alert('Error al cargar opciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta opción?')) return;
    try {
      await api.deletePanelOption(id);
      await loadOptions();
      alert('Opción eliminada');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const data = {
      id: formData.get('id') as string,
      nombre: formData.get('nombre') as string,
      tipo: formData.get('tipo') as string,
      precio: parseFloat(formData.get('precio') as string),
      attrs: {},
    };

    try {
      if (editingOption) {
        await api.updatePanelOption(editingOption.id, data);
        alert('Opción actualizada');
      } else {
        await api.createPanelOption(data);
        alert('Opción creada');
      }
      setIsModalOpen(false);
      await loadOptions();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Opciones de Cuadro</h2>
          <p className="text-sm text-gray-600">Dataloggers, protecciones y otros componentes</p>
        </div>
        <Button onClick={() => { setEditingOption(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nueva Opción
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">ID</th>
                <th className="text-left py-3 px-4 font-medium">Nombre</th>
                <th className="text-left py-3 px-4 font-medium">Tipo</th>
                <th className="text-left py-3 px-4 font-medium">Precio</th>
                <th className="text-right py-3 px-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt) => (
                <tr key={opt.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{opt.id}</td>
                  <td className="py-3 px-4">{opt.nombre}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      {opt.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4">{opt.precio}€</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingOption(opt); setIsModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(opt.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingOption ? 'Editar Opción' : 'Nueva Opción'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label>ID *</Label>
                <Input name="id" required defaultValue={editingOption?.id || ''} disabled={!!editingOption} />
              </div>
              <div>
                <Label>Nombre *</Label>
                <Input name="nombre" required defaultValue={editingOption?.nombre || ''} />
              </div>
              <div>
                <Label>Tipo *</Label>
                <select name="tipo" required className="w-full h-10 px-3 rounded-md border" defaultValue={editingOption?.tipo || ''}>
                  <option value="">Seleccionar...</option>
                  <option value="datalogger">Datalogger</option>
                  <option value="proteccion">Protección</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <Label>Precio (€) *</Label>
                <Input name="precio" type="number" step="0.01" required defaultValue={editingOption?.precio || ''} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingOption ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

