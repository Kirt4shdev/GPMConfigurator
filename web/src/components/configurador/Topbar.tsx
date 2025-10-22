import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { LogOut, ArrowLeft } from 'lucide-react';

interface TopbarProps {
  project: any;
}

export const Topbar = ({ project }: TopbarProps) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-16 border-b bg-background px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="h-8 w-px bg-border" />
        <div>
          <h1 className="font-semibold">{project.name}</h1>
          <p className="text-xs text-muted-foreground">Configurador de Estaciones</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <img
          src="/assets/lockup_dilus_gpm_horizontal.png"
          alt="Grupo Dilus + GPM"
          className="h-10"
        />
        <div className="h-8 w-px bg-border" />
        <div className="text-right text-sm">
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

