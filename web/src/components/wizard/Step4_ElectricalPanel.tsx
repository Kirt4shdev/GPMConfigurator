import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { api } from '@/lib/api';
import { Check, Loader2, Cpu, Shield, Battery, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PanelOption {
  id: string;
  nombre: string;
  marca: string;
  tipo: string;
  precio_unitario: number;
  backup_horas?: number;
}

interface Step4Props {
  tipoNombre: string;
  initialData?: {
    datalogger?: string;
    protecciones: string[];
    bateria?: string;
    kitSolar?: string;
    horasBackup: number;
  };
  onComplete: (data: {
    datalogger?: string;
    protecciones: string[];
    bateria?: string;
    kitSolar?: string;
    horasBackup: number;
  }) => void;
  onBack: () => void;
}

export const Step4_ElectricalPanel = ({ tipoNombre, initialData, onComplete, onBack }: Step4Props) => {
  const [loading, setLoading] = useState(false);
  
  const [dataloggers, setDataloggers] = useState<PanelOption[]>([]);
  const [protecciones, setProtecciones] = useState<PanelOption[]>([]);
  const [baterias, setBaterias] = useState<PanelOption[]>([]);
  const [kitsSolares, setKitsSolares] = useState<PanelOption[]>([]);
  
  const [selectedDatalogger, setSelectedDatalogger] = useState<string | null>(
    initialData?.datalogger || null
  );
  const [selectedProtecciones, setSelectedProtecciones] = useState<string[]>(
    initialData?.protecciones || []
  );
  const [selectedBateria, setSelectedBateria] = useState<string | null>(
    initialData?.bateria || null
  );
  const [selectedKitSolar, setSelectedKitSolar] = useState<string | null>(
    initialData?.kitSolar || null
  );
  const [horasBackup, setHorasBackup] = useState(initialData?.horasBackup || 24);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    // Auto-seleccionar batería según horas de backup (solo si no hay una ya seleccionada)
    if (baterias.length > 0 && horasBackup > 0 && !initialData?.bateria) {
      const suitable = baterias
        .filter((b) => (b.backup_horas || 0) >= horasBackup)
        .sort((a, b) => a.precio_unitario - b.precio_unitario);
      
      if (suitable.length > 0 && !selectedBateria) {
        setSelectedBateria(suitable[0].id);
      }
    }
  }, [horasBackup, baterias, initialData]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const [dls, prots, bats, solar] = await Promise.all([
        api.getPanelOptions('datalogger'),
        api.getPanelOptions('proteccion'),
        api.getPanelOptions('bateria'),
        api.getPanelOptions('solar'),
      ]);

      setDataloggers(dls);
      setProtecciones(prots);
      setBaterias(bats);
      setKitsSolares(solar);

      // Auto-seleccionar datalogger recomendado (solo si no hay uno ya seleccionado)
      if (!initialData?.datalogger) {
        const recommended = dls.find((d: PanelOption) => 
          d.nombre.toLowerCase().includes('cr1000x') ||
          d.nombre.toLowerCase().includes('edge-01')
        );
        if (recommended) {
          setSelectedDatalogger(recommended.id);
        }
      }
    } catch (error) {
      console.error('Error loading panel options:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProteccion = (id: string) => {
    if (selectedProtecciones.includes(id)) {
      setSelectedProtecciones(selectedProtecciones.filter((p) => p !== id));
    } else {
      setSelectedProtecciones([...selectedProtecciones, id]);
    }
  };

  const isValid = () => {
    return selectedDatalogger !== null;
  };

  const handleContinue = () => {
    if (!isValid()) return;
    onComplete({
      datalogger: selectedDatalogger || undefined,
      protecciones: selectedProtecciones,
      bateria: selectedBateria || undefined,
      kitSolar: selectedKitSolar || undefined,
      horasBackup,
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
        <h3 className="text-lg font-semibold mb-2">Cuadro Eléctrico - {tipoNombre}</h3>
        <p className="text-sm text-muted-foreground">
          Seleccione el datalogger, protecciones y sistema de alimentación
        </p>
      </div>

      {/* Datalogger */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium">Datalogger *</h4>
            <p className="text-xs text-muted-foreground">Sistema de adquisición de datos</p>
          </div>
        </div>

        {dataloggers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay dataloggers disponibles. Añádalos desde el Panel de Administración.
          </p>
        ) : (
          <div className="grid gap-3">
            {dataloggers.map((dl) => (
              <button
                key={dl.id}
                onClick={() => setSelectedDatalogger(dl.id)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-all',
                  selectedDatalogger === dl.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      selectedDatalogger === dl.id
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/50'
                    )}
                  >
                    {selectedDatalogger === dl.id && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{dl.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {dl.marca} • €{dl.precio_unitario.toFixed(2)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Protecciones */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h4 className="font-medium">Protecciones</h4>
            <p className="text-xs text-muted-foreground">Sobretensiones, fusibles, etc.</p>
          </div>
        </div>

        {protecciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay protecciones disponibles
          </p>
        ) : (
          <div className="grid gap-2">
            {protecciones.map((prot) => (
              <label
                key={prot.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  selectedProtecciones.includes(prot.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedProtecciones.includes(prot.id)}
                  onChange={() => toggleProteccion(prot.id)}
                  className="w-4 h-4 rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{prot.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {prot.marca} • €{prot.precio_unitario.toFixed(2)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Energía */}
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <h4 className="font-medium">Sistema de Alimentación</h4>
        
        <div className="space-y-2">
          <Label htmlFor="horas-backup">Horas de autonomía requeridas</Label>
          <Input
            id="horas-backup"
            type="number"
            min="0"
            max="168"
            step="1"
            value={horasBackup}
            onChange={(e) => setHorasBackup(parseInt(e.target.value) || 0)}
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">
            El sistema seleccionará automáticamente batería y kit solar apropiados
          </p>
        </div>

        {/* Batería */}
        {baterias.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-green-600" />
              <Label>Batería</Label>
            </div>
            {baterias
              .filter((b) => (b.backup_horas || 0) >= horasBackup)
              .slice(0, 3)
              .map((bat) => (
                <button
                  key={bat.id}
                  onClick={() => setSelectedBateria(bat.id)}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-all',
                    selectedBateria === bat.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2',
                        selectedBateria === bat.id ? 'bg-primary border-primary' : 'border-muted-foreground/50'
                      )}
                    >
                      {selectedBateria === bat.id && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{bat.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {bat.marca} • {bat.backup_horas}h • €{bat.precio_unitario.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}

        {/* Kit Solar */}
        {kitsSolares.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-600" />
              <Label>Kit Solar</Label>
            </div>
            {kitsSolares.slice(0, 3).map((kit) => (
              <button
                key={kit.id}
                onClick={() => setSelectedKitSolar(kit.id)}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-all',
                  selectedKitSolar === kit.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2',
                      selectedKitSolar === kit.id ? 'bg-primary border-primary' : 'border-muted-foreground/50'
                    )}
                  >
                    {selectedKitSolar === kit.id && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{kit.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {kit.marca} • €{kit.precio_unitario.toFixed(2)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Anterior
        </Button>
        <Button onClick={handleContinue} disabled={!isValid()}>
          Continuar a Resumen
        </Button>
      </div>
    </div>
  );
};

