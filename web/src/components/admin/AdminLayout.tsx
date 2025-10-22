import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import {
  LayoutDashboard,
  Users,
  Radio,
  MapPin,
  Package,
  Wrench,
  Database,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Sensores', href: '/admin/catalogo/sensores', icon: Radio },
  { name: 'Hotspots', href: '/admin/catalogo/hotspots', icon: MapPin },
  { name: 'Opciones de Cuadro', href: '/admin/catalogo/opciones', icon: Package },
  { name: 'Reglas de Instalación', href: '/admin/reglas/instalacion', icon: Wrench },
  { name: 'Import/Export', href: '/admin/datos', icon: Database },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item: typeof navigation[0]) => {
    if (item.exact) {
      return location.pathname === item.href;
    }
    return location.pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar para desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <img
              src="/assets/lockup_dilus_gpm_horizontal.png"
              alt="GPM"
              className="h-8 w-auto"
            />
          </div>
          
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${
                        active
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="px-2 space-y-1 pb-4">
              <Link
                to="/"
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Home className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                Ir al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <img
                  src="/assets/lockup_dilus_gpm_horizontal.png"
                  alt="GPM"
                  className="h-8 w-auto"
                />
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md
                        ${
                          active
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

