import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Configurador } from './pages/Configurador';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './pages/admin/Overview';
import { AdminSensores } from './pages/admin/Sensores';
import { AdminHotspots } from './pages/admin/Hotspots';
import { AdminOpcionesCuadro } from './pages/admin/OpcionesCuadro';
import { AdminReglasInstalacion } from './pages/admin/ReglasInstalacion';
import { AdminImportExport } from './pages/admin/ImportExport';
import { AdminUsuarios } from './pages/admin/Usuarios';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/configurador/:projectId"
          element={
            <PrivateRoute>
              <Configurador />
            </PrivateRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout>
                <AdminOverview />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/admin/catalogo/sensores"
          element={
            <AdminGuard>
              <AdminLayout>
                <AdminSensores />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/admin/catalogo/hotspots"
          element={
            <AdminGuard>
              <AdminLayout>
                <AdminHotspots />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/admin/catalogo/opciones"
          element={
            <AdminGuard>
              <AdminLayout>
                <AdminOpcionesCuadro />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/admin/reglas/instalacion"
          element={
            <AdminGuard>
              <AdminLayout>
                <AdminReglasInstalacion />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/admin/datos"
          element={
            <AdminGuard>
              <AdminLayout>
                <AdminImportExport />
              </AdminLayout>
            </AdminGuard>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <AdminGuard>
              <AdminLayout>
                <AdminUsuarios />
              </AdminLayout>
            </AdminGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

