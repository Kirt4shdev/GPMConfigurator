import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/Dialog';
import { Steps } from '@/components/ui/Steps';
import { useWizardStore } from '@/store/useWizardStore';
import { Step0_Initial } from './Step0_Initial';
import { Step1_Wind } from './Step1_Wind';
import { Step2_POAs } from './Step2_POAs';
import { Step3_Radiation } from './Step3_Radiation';
import { Step4_ElectricalPanel } from './Step4_ElectricalPanel';
import { Step5_Summary } from './Step5_Summary';

interface WizardEstacionesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  provincia?: string;
  onComplete: () => void;
}

const WIZARD_STEPS = [
  { id: 'initial', title: 'Configuración', description: 'Tipos y cantidades' },
  { id: 'wind', title: 'Viento', description: 'Sensores de viento' },
  { id: 'poas', title: 'POAs', description: 'Planos de orientación' },
  { id: 'radiation', title: 'Radiación', description: 'Sensores de radiación' },
  { id: 'electrical', title: 'Cuadro', description: 'Panel eléctrico' },
  { id: 'summary', title: 'Resumen', description: 'Confirmar y crear' },
];

export const WizardEstaciones = ({
  open,
  onOpenChange,
  projectId,
  provincia: initialProvincia,
  onComplete,
}: WizardEstacionesProps) => {
  const {
    setCurrentStep,
    tipos,
    setTipos,
    currentTipoIndex,
    setCurrentTipoIndex,
    updateCurrentTipo,
    provincia,
    setProvincia,
    reset,
  } = useWizardStore();

  const [internalStep, setInternalStep] = useState(0);

  // Reset cuando se abre
  useEffect(() => {
    if (open) {
      reset();
      setInternalStep(0);
      if (initialProvincia) {
        setProvincia(initialProvincia);
      }
    }
  }, [open]);

  const handleStep0Complete = (data: { provincia: string; tipos: any[] }) => {
    setProvincia(data.provincia);
    setTipos(data.tipos);
    setCurrentTipoIndex(0);
    setInternalStep(1);
    setCurrentStep(1);
  };

  const handleStep1Complete = (data: {
    tipo: 'multiparametrico' | 'analogico';
    selections: any[];
  }) => {
    updateCurrentTipo({
      tipoViento: data.tipo,
      sensoresViento: data.selections,
    });
    setInternalStep(2);
    setCurrentStep(2);
  };

  const handleStep2Complete = (poas: any[]) => {
    updateCurrentTipo({
      poas,
    });
    setInternalStep(3);
    setCurrentStep(3);
  };

  const handleStep3Complete = (data: any) => {
    updateCurrentTipo({
      radiacionHorizontal: data.radiacionHorizontal,
      sensorRadiacionHorizontal: data.sensorRadiacionHorizontal,
      poasConfig: data.poasConfig,
    });
    setInternalStep(4);
    setCurrentStep(4);
  };

  const handleStep4Complete = (data: any) => {
    updateCurrentTipo({
      datalogger: data.datalogger,
      protecciones: data.protecciones,
      bateria: data.bateria,
      kitSolar: data.kitSolar,
      horasBackup: data.horasBackup,
    });

    // Si hay más tipos, volver al paso 1 para el siguiente tipo
    if (currentTipoIndex < tipos.length - 1) {
      setCurrentTipoIndex(currentTipoIndex + 1);
      setInternalStep(1);
      setCurrentStep(1);
    } else {
      // Todos los tipos completados, ir al resumen
      setInternalStep(5);
      setCurrentStep(5);
    }
  };

  const handleWizardComplete = () => {
    onOpenChange(false);
    reset();
    onComplete();
  };

  const handleBack = () => {
    if (internalStep > 0) {
      setInternalStep(internalStep - 1);
      setCurrentStep(internalStep - 1);
    }
  };

  const currentTipo = tipos[currentTipoIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="5xl" showClose={internalStep === 0}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🪄</span>
            <span>Asistente de Configuración de Estaciones</span>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Progress Steps */}
            {internalStep > 0 && (
              <Steps steps={WIZARD_STEPS} currentStep={internalStep} />
            )}

            {/* Indicador de tipo si hay múltiples */}
            {tipos.length > 1 && internalStep > 0 && internalStep < 5 && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
                  <strong>Configurando:</strong> {currentTipo?.nombre} (
                  {currentTipo?.cantidad} {currentTipo?.cantidad === 1 ? 'estación' : 'estaciones'}
                  ) • Tipo {currentTipoIndex + 1} de {tipos.length}
                </p>
              </div>
            )}

            {/* Step Content */}
            <div className="min-h-[400px]">
              {internalStep === 0 && (
                <Step0_Initial provincia={provincia} onComplete={handleStep0Complete} />
              )}

              {internalStep === 1 && currentTipo && (
                <Step1_Wind
                  tipoNombre={currentTipo.nombre}
                  onComplete={handleStep1Complete}
                  onBack={handleBack}
                />
              )}

              {internalStep === 2 && currentTipo && (
                <Step2_POAs
                  tipoNombre={currentTipo.nombre}
                  onComplete={handleStep2Complete}
                  onBack={handleBack}
                />
              )}

              {internalStep === 3 && currentTipo && (
                <Step3_Radiation
                  tipoNombre={currentTipo.nombre}
                  poas={currentTipo.poas || []}
                  onComplete={handleStep3Complete}
                  onBack={handleBack}
                />
              )}

              {internalStep === 4 && currentTipo && (
                <Step4_ElectricalPanel
                  tipoNombre={currentTipo.nombre}
                  onComplete={handleStep4Complete}
                  onBack={handleBack}
                />
              )}

              {internalStep === 5 && provincia && projectId && (
                <Step5_Summary
                  projectId={projectId}
                  provincia={provincia}
                  tipos={tipos}
                  onComplete={handleWizardComplete}
                  onBack={handleBack}
                />
              )}
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

