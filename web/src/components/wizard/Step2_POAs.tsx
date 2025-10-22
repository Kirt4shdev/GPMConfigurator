import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Plus, Trash2, Box } from 'lucide-react';
import { cn } from '@/lib/cn';

interface POA {
  nombre: string;
  distancia_m: number;
}

interface Step2Props {
  tipoNombre: string;
  onComplete: (poas: POA[]) => void;
  onBack: () => void;
}

export const Step2_POAs = ({ tipoNombre, onComplete, onBack }: Step2Props) => {
  const [poas, setPOAs] = useState<POA[]>([
    { nombre: 'POA 1', distancia_m: 10 },
  ]);

  const addPOA = () => {
    setPOAs([...poas, { nombre: `POA ${poas.length + 1}`, distancia_m: 10 }]);
  };

  const removePOA = (index: number) => {
    if (poas.length === 1) return;
    setPOAs(poas.filter((_, i) => i !== index));
  };

  const updatePOA = (index: number, field: keyof POA, value: string | number) => {
    const updated = [...poas];
    updated[index] = { ...updated[index], [field]: value };
    setPOAs(updated);
  };

  const isValid = () => {
    return poas.every((poa) => poa.nombre.trim() && poa.distancia_m > 0);
  };

  const handleContinue = () => {
    if (!isValid()) return;
    onComplete(poas);
  };

  const handleSkip = () => {
    onComplete([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configuración de POAs - {tipoNombre}</h3>
        <p className="text-sm text-muted-foreground">
          Define los Planos de Orientación (POAs) para mediciones de radiación inclinada.
          Puedes omitir este paso si solo necesitas medición horizontal.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>POAs del Proyecto</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPOA}
            disabled={poas.length >= 20}
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir POA
          </Button>
        </div>

        <div className="space-y-3">
          {poas.map((poa, index) => (
            <div
              key={index}
              className={cn(
                'flex items-end gap-3 p-4 rounded-lg border-2 bg-card',
                'transition-colors hover:border-primary/50'
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Box className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`poa-nombre-${index}`}>Nombre del POA</Label>
                <Input
                  id={`poa-nombre-${index}`}
                  value={poa.nombre}
                  onChange={(e) => updatePOA(index, 'nombre', e.target.value)}
                  placeholder="Ej: POA Este, POA Oeste..."
                />
              </div>
              <div className="w-40 space-y-2">
                <Label htmlFor={`poa-distancia-${index}`}>
                  Distancia (m)
                </Label>
                <Input
                  id={`poa-distancia-${index}`}
                  type="number"
                  min="1"
                  max="500"
                  step="0.1"
                  value={poa.distancia_m}
                  onChange={(e) => updatePOA(index, 'distancia_m', parseFloat(e.target.value) || 1)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePOA(index)}
                disabled={poas.length === 1}
                className="h-10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Consejo:</strong> La distancia de cada POA a la estación se usará como
            sugerencia para la longitud de cable de los sensores instalados en ese POA.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Anterior
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Omitir POAs
          </Button>
          <Button onClick={handleContinue} disabled={!isValid()}>
            Continuar a Radiación
          </Button>
        </div>
      </div>
    </div>
  );
};

