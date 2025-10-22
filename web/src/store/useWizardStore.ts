import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WizardStationType {
  id: string;
  nombre: string;
  cantidad: number;
  // Paso 1: Viento
  tipoViento?: 'multiparametrico' | 'analogico';
  sensoresViento?: Array<{
    sensor_id: string;
    hotspot_key: string;
    metros_cable: number;
  }>;
  // Paso 2: POAs
  poas?: Array<{
    nombre: string;
    distancia_m: number;
  }>;
  // Paso 3: Radiación y temperatura
  radiacionHorizontal?: boolean;
  sensorRadiacionHorizontal?: {
    sensor_id: string;
    hotspot_key: string;
    metros_cable: number;
  };
  poasConfig?: Array<{
    temperaturaPanel: boolean;
    numSensoresTemp: number;
    radiacionInclinada: boolean;
    ensuciamiento: boolean;
    sensoresTemp: Array<{ sensor_id: string; metros_cable: number }>;
    sensoresRadiacion: Array<{ sensor_id: string; metros_cable: number }>;
    sensoresEnsuciamiento: Array<{ sensor_id: string; metros_cable: number }>;
  }>;
  // Paso 4: Cuadro eléctrico
  datalogger?: string; // option_id
  protecciones?: string[]; // option_ids
  bateria?: string; // option_id
  kitSolar?: string; // option_id
  horasBackup?: number;
}

interface WizardState {
  isOpen: boolean;
  currentStep: number;
  projectId: string | null;
  provincia: string | null;
  tipos: WizardStationType[];
  currentTipoIndex: number;
  
  // Actions
  openWizard: (projectId: string, provincia?: string) => void;
  closeWizard: () => void;
  setCurrentStep: (step: number) => void;
  setCurrentTipoIndex: (index: number) => void;
  setProvincia: (provincia: string) => void;
  
  // Tipo management
  setTipos: (tipos: Omit<WizardStationType, 'id'>[]) => void;
  updateCurrentTipo: (data: Partial<WizardStationType>) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  isOpen: false,
  currentStep: 0,
  projectId: null,
  provincia: null,
  tipos: [],
  currentTipoIndex: 0,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      openWizard: (projectId: string, provincia?: string) => {
        set({
          isOpen: true,
          projectId,
          provincia: provincia || null,
          currentStep: 0,
          tipos: [],
          currentTipoIndex: 0,
        });
      },
      
      closeWizard: () => {
        set({ isOpen: false });
      },
      
      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },
      
      setCurrentTipoIndex: (index: number) => {
        set({ currentTipoIndex: index });
      },
      
      setProvincia: (provincia: string) => {
        set({ provincia });
      },
      
      setTipos: (tipos) => {
        set({
          tipos: tipos.map((tipo, index) => ({
            ...tipo,
            id: `tipo-${index}-${Date.now()}`,
          })),
        });
      },
      
      updateCurrentTipo: (data) => {
        const { tipos, currentTipoIndex } = get();
        const updatedTipos = [...tipos];
        updatedTipos[currentTipoIndex] = {
          ...updatedTipos[currentTipoIndex],
          ...data,
        };
        set({ tipos: updatedTipos });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'wizard-storage',
      partialize: (state) => ({
        tipos: state.tipos,
        currentStep: state.currentStep,
        currentTipoIndex: state.currentTipoIndex,
        projectId: state.projectId,
        provincia: state.provincia,
      }),
    }
  )
);

