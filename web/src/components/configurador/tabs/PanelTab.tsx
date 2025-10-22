import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

interface PanelTabProps {
  station: any;
  onUpdate: () => void;
}

export const PanelTab = ({ station, onUpdate }: PanelTabProps) => {
  const [panelOptions, setPanelOptions] = useState<any[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    loadPanelOptions();
  }, []);

  const loadPanelOptions = async () => {
    try {
      const data = await api.getPanelOptions();
      setPanelOptions(data);
    } catch (error) {
      console.error('Error loading panel options:', error);
    }
  };

  const handleAddOption = async (optionId: string) => {
    try {
      await api.addStationPanelOption(station.id, {
        panel_option_id: optionId,
        quantity: 1,
      });
      setShowSelector(false);
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRemoveOption = async (optionId: string) => {
    if (!confirm('¿Eliminar esta opción?')) return;

    try {
      await api.deleteStationPanelOption(station.id, optionId);
      onUpdate();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const selectedOptions = station.panel_options || [];
  const totalPanel = selectedOptions.reduce(
    (sum: number, opt: any) => sum + parseFloat(opt.precio) * opt.quantity,
    0
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Opciones de Cuadro Eléctrico</h4>
        <Button size="sm" onClick={() => setShowSelector(!showSelector)}>
          <Plus className="w-4 h-4 mr-1" />
          Añadir
        </Button>
      </div>

      {showSelector && (
        <div className="border rounded-lg p-3 space-y-2 max-h-64 overflow-auto">
          {panelOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAddOption(option.id)}
              className="w-full text-left p-2 border rounded hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{option.nombre}</p>
                  <p className="text-xs text-muted-foreground">{option.tipo}</p>
                </div>
                <p className="text-sm font-semibold">{option.precio} €</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay opciones seleccionadas</p>
      ) : (
        <div className="space-y-2">
          {selectedOptions.map((option: any) => (
            <div key={option.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{option.nombre}</p>
                  <p className="text-xs text-muted-foreground">{option.tipo}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveOption(option.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cantidad: {option.quantity}</span>
                  <span className="font-medium">
                    {(parseFloat(option.precio) * option.quantity).toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold">
              <span>Subtotal Cuadro:</span>
              <span>{totalPanel.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

