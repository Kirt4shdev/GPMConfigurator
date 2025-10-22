import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/configurador/Sidebar';
import { SVGViewer } from '@/components/configurador/SVGViewer';
import { RightPanel } from '@/components/configurador/RightPanel';
import { Topbar } from '@/components/configurador/Topbar';

export const Configurador = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [currentStation, setCurrentStation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const [projectData, stationsData] = await Promise.all([
        api.getProject(projectId!),
        api.getStations(projectId!),
      ]);
      setProject(projectData);
      setStations(stationsData);

      if (stationsData.length > 0) {
        loadStation(stationsData[0].id);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStation = async (stationId: string) => {
    try {
      const stationData = await api.getStation(stationId);
      setCurrentStation(stationData);
    } catch (error) {
      console.error('Error loading station:', error);
    }
  };

  const handleCreateStation = async () => {
    const name = prompt('Nombre de la estación:');
    if (!name) return;

    try {
      const station = await api.createStation({
        project_id: projectId,
        name,
        provincia: 'Madrid',
      });
      setStations([...stations, station]);
      loadStation(station.id);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSelectStation = (stationId: string) => {
    loadStation(stationId);
  };

  const handleStationUpdate = () => {
    if (currentStation) {
      loadStation(currentStation.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando configurador...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Topbar project={project} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          stations={stations}
          currentStation={currentStation}
          onSelectStation={handleSelectStation}
          onCreateStation={handleCreateStation}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-muted/30 p-4 overflow-auto">
            {currentStation ? (
              <SVGViewer
                station={currentStation}
                onUpdate={handleStationUpdate}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No hay estaciones en este proyecto</p>
                  <button
                    onClick={handleCreateStation}
                    className="text-primary hover:underline"
                  >
                    Crear primera estación
                  </button>
                </div>
              </div>
            )}
          </div>

          <RightPanel
            station={currentStation}
            onUpdate={handleStationUpdate}
          />
        </div>
      </div>
    </div>
  );
};

