import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, FolderOpen, Shield } from 'lucide-react';

export const Dashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const setCurrentProject = useConfiguratorStore((state) => state.setCurrentProject);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      // Debug: Ver el rol del usuario
      console.log('Dashboard - Usuario actual:', user);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    const name = prompt('Nombre del proyecto:');
    if (!name) return;

    try {
      const project = await api.createProject({ name });
      setProjects([project, ...projects]);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleOpenProject = (projectId: string) => {
    setCurrentProject(projectId);
    navigate(`/configurador/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Mis Proyectos</h1>
              {user?.role === 'admin' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrador
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Gestiona tus proyectos y estaciones meteorológicas
            </p>
          </div>
          <div className="flex gap-2">
            {user?.role === 'admin' && (
              <Button 
                variant="default" 
                onClick={() => {
                  console.log('Navegando a /admin...');
                  navigate('/admin');
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Panel Admin
              </Button>
            )}
            <Button onClick={handleCreateProject}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay proyectos</h3>
              <p className="text-muted-foreground mb-4">Crea tu primer proyecto para comenzar</p>
              <Button onClick={handleCreateProject}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Proyecto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleOpenProject(project.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  )}
                  {project.client_name && (
                    <p className="text-sm">
                      <strong>Cliente:</strong> {project.client_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">
                    Creado: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

