import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StationType {
  nombre: string;
  cantidad: number;
}

interface Step0Props {
  provincia: string | null;
  onComplete: (data: { provincia: string; tipos: StationType[] }) => void;
}

export const Step0_Initial = ({ provincia: initialProvincia, onComplete }: Step0Props) => {
  const [provincia, setProvincia] = useState(initialProvincia || '');
  const [tipos, setTipos] = useState<StationType[]>([
    { nombre: '', cantidad: 1 },
  ]);

  const addTipo = () => {
    setTipos([...tipos, { nombre: '', cantidad: 1 }]);
  };

  const removeTipo = (index: number) => {
    if (tipos.length === 1) return;
    setTipos(tipos.filter((_, i) => i !== index));
  };

  const updateTipo = (index: number, field: keyof StationType, value: string | number) => {
    const updated = [...tipos];
    updated[index] = { ...updated[index], [field]: value };
    setTipos(updated);
  };

  const isValid = () => {
    if (!provincia.trim()) return false;
    return tipos.every((tipo) => tipo.nombre.trim() && tipo.cantidad > 0);
  };

  const handleContinue = () => {
    if (!isValid()) return;
    onComplete({ provincia, tipos });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Configuración Inicial del Proyecto</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Defina la provincia del proyecto y los tipos de estaciones que desea configurar.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provincia">Provincia del Proyecto *</Label>
          <Input
            id="provincia"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            placeholder="Ej: Madrid"
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            La provincia se usará para calcular costes de instalación y transporte
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Label>Tipos de Estación *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTipo}
              disabled={tipos.length >= 10}
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Tipo
            </Button>
          </div>

          <div className="space-y-3">
            {tipos.map((tipo, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-end gap-3 p-4 rounded-lg border bg-muted/30',
                  'transition-colors hover:bg-muted/50'
                )}
              >
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`tipo-nombre-${index}`}>Nombre del Tipo {index + 1}</Label>
                  <Input
                    id={`tipo-nombre-${index}`}
                    value={tipo.nombre}
                    onChange={(e) => updateTipo(index, 'nombre', e.target.value)}
                    placeholder="Ej: Estación Principal, Estación Auxiliar..."
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`tipo-cantidad-${index}`}>Cantidad</Label>
                  <Input
                    id={`tipo-cantidad-${index}`}
                    type="number"
                    min="1"
                    max="100"
                    value={tipo.cantidad}
                    onChange={(e) => updateTipo(index, 'cantidad', parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTipo(index)}
                  disabled={tipos.length === 1}
                  className="h-10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Configure diferentes tipos de estaciones si necesita variaciones en la configuración.
            Por ejemplo, una "Estación Principal" con más sensores y "Estaciones Secundarias" más simples.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleContinue} disabled={!isValid()} size="lg">
          Continuar con la Configuración
        </Button>
      </div>
    </div>
  );
};

