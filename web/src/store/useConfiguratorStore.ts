import { create } from 'zustand';

interface ConfiguratorState {
  currentProjectId: string | null;
  currentStationId: string | null;
  setCurrentProject: (id: string | null) => void;
  setCurrentStation: (id: string | null) => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  currentProjectId: null,
  currentStationId: null,
  setCurrentProject: (id) => set({ currentProjectId: id }),
  setCurrentStation: (id) => set({ currentStationId: id }),
}));

