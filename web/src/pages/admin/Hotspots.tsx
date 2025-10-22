import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import esquemaUrl from '@/assets/infografia_Renovables_centered.svg';

export const AdminHotspots = () => {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [draggedHotspot, setDraggedHotspot] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadHotspots();
  }, []);

  // Event listeners globales para drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedHotspot || !svgRef.current) return;

      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      
      const screenCTM = svg.getScreenCTM();
      if (!screenCTM) return;
      
      const svgP = pt.matrixTransform(screenCTM.inverse());

      // Update local state
      setHotspots((prev) =>
        prev.map((h) =>
          h.key === draggedHotspot ? { ...h, x: svgP.x, y: svgP.y } : h
        )
      );
    };

    const handleMouseUp = async () => {
      if (!draggedHotspot) return;

      const hotspot = hotspots.find((h) => h.key === draggedHotspot);
      if (hotspot) {
        try {
          await api.updateHotspot(hotspot.key, {
            x: hotspot.x,
            y: hotspot.y,
            label: hotspot.label || '',
          });
          console.log(`✓ Hotspot ${hotspot.key} guardado en (${hotspot.x.toFixed(2)}, ${hotspot.y.toFixed(2)})`);
        } catch (error: any) {
          console.error('Error updating hotspot:', error);
          alert(`Error al guardar: ${error.message}`);
          await loadHotspots(); // Reload on error
        }
      }
      setDraggedHotspot(null);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedHotspot, hotspots]);

  const loadHotspots = async () => {
    try {
      const data = await api.getHotspots();
      setHotspots(data);
    } catch (error: any) {
      console.error('Error loading hotspots:', error);
      alert('Error al cargar hotspots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingHotspot(null);
    setIsModalOpen(true);
  };

  const handleEdit = (hotspot: any) => {
    setEditingHotspot(hotspot);
    setIsModalOpen(true);
  };

  const handleDelete = async (key: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este hotspot?')) return;

    try {
      await api.deleteHotspot(key);
      await loadHotspots();
      alert('Hotspot eliminado correctamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const data = {
      key: formData.get('key') as string,
      x: parseFloat(formData.get('x') as string),
      y: parseFloat(formData.get('y') as string),
      label: formData.get('label') as string,
    };

    try {
      if (editingHotspot) {
        await api.updateHotspot(editingHotspot.key, data);
        alert('Hotspot actualizado correctamente');
      } else {
        await api.createHotspot(data);
        alert('Hotspot creado correctamente');
      }
      setIsModalOpen(false);
      await loadHotspots();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    console.log(`Clicked at: x=${svgP.x.toFixed(2)}, y=${svgP.y.toFixed(2)}`);
  };

  const handleHotspotDragStart = (key: string) => {
    setDraggedHotspot(key);
    setIsDragging(true);
  };

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
          <h2 className="text-2xl font-bold">Gestión de Hotspots</h2>
          <p className="text-sm text-gray-600">
            Administra las posiciones sobre el SVG de la estación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditor(!showEditor)}>
            {showEditor ? 'Ver Tabla' : 'Ver Editor SVG'}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Hotspot
          </Button>
        </div>
      </div>

      {showEditor ? (
        <Card>
          <CardHeader>
            <CardTitle>Editor Visual de Hotspots</CardTitle>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Arrastra los puntos para reposicionar. Los cambios se guardan automáticamente.
              </p>
              {isDragging && (
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  Arrastrando...
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto bg-gray-50 p-4">
              <svg
                ref={svgRef}
                onClick={handleSvgClick}
                viewBox="0 0 161 150"
                className="w-full h-auto"
                style={{ minHeight: '600px', maxHeight: '80vh' }}
              >
                {/* SVG de la estación */}
                <image
                  href={esquemaUrl}
                  width="161"
                  height="150"
                  preserveAspectRatio="xMidYMid meet"
                />

                {/* Hotspots */}
                {hotspots.map((hotspot) => (
                  <g key={hotspot.key}>
                    <circle
                      cx={hotspot.x}
                      cy={hotspot.y}
                      r="3"
                      fill={isDragging && draggedHotspot === hotspot.key ? '#3b82f6' : '#ef4444'}
                      stroke="white"
                      strokeWidth="1"
                      className="cursor-move hover:fill-blue-500 transition-all"
                      style={{
                        filter: isDragging && draggedHotspot === hotspot.key 
                          ? 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.8))' 
                          : 'drop-shadow(0 0.5px 1px rgba(0,0,0,0.3))'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleHotspotDragStart(hotspot.key);
                      }}
                    />
                    <text
                      x={hotspot.x}
                      y={hotspot.y - 5}
                      textAnchor="middle"
                      fontSize="4"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                      fill="black"
                      stroke="white"
                      strokeWidth="1"
                      paintOrder="stroke"
                    >
                      {hotspot.label || hotspot.key}
                    </text>
                    <text
                      x={hotspot.x}
                      y={hotspot.y - 5}
                      textAnchor="middle"
                      fontSize="4"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                      fill="black"
                    >
                      {hotspot.label || hotspot.key}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Key</th>
                    <th className="text-left py-3 px-4 font-medium">X</th>
                    <th className="text-left py-3 px-4 font-medium">Y</th>
                    <th className="text-left py-3 px-4 font-medium">Label</th>
                    <th className="text-right py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspots.map((hotspot) => (
                    <tr key={hotspot.key} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{hotspot.key}</td>
                      <td className="py-3 px-4">{parseFloat(hotspot.x).toFixed(2)}</td>
                      <td className="py-3 px-4">{parseFloat(hotspot.y).toFixed(2)}</td>
                      <td className="py-3 px-4">{hotspot.label || '-'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(hotspot)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(hotspot.key)}
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
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingHotspot ? 'Editar Hotspot' : 'Nuevo Hotspot'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label>Key *</Label>
                <Input
                  name="key"
                  required
                  defaultValue={editingHotspot?.key || ''}
                  disabled={!!editingHotspot}
                  placeholder="H1, H2, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>X *</Label>
                  <Input
                    name="x"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingHotspot?.x || ''}
                  />
                </div>
                <div>
                  <Label>Y *</Label>
                  <Input
                    name="y"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingHotspot?.y || ''}
                  />
                </div>
              </div>
              <div>
                <Label>Label</Label>
                <Input
                  name="label"
                  defaultValue={editingHotspot?.label || ''}
                  placeholder="Descripción opcional"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingHotspot ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

