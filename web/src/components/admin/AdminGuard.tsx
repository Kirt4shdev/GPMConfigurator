import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Debug: Ver qué está pasando
  console.log('AdminGuard:', { user, isAuthenticated, isLoading, role: user?.role });

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

  if (!isAuthenticated) {
    console.log('AdminGuard: Usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    console.log('AdminGuard: Usuario no es admin (rol:', user?.role, '), redirigiendo a /');
    return <Navigate to="/" replace />;
  }

  console.log('AdminGuard: Usuario es admin, permitiendo acceso');
  return <>{children}</>;
};

