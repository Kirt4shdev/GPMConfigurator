import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Shield, User } from 'lucide-react';

export const AdminUsuarios = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error: any) {
      alert('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'usuario' : 'admin';
    
    if (!confirm(`¿Cambiar rol a "${newRole}"?`)) return;

    try {
      await api.updateUserRole(userId, newRole);
      await loadUsers();
      alert('Rol actualizado correctamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <p className="text-sm text-gray-600">Administra roles y permisos</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Rol</th>
                  <th className="text-left py-3 px-4 font-medium">Fecha de Registro</th>
                  <th className="text-right py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeRole(user.id, user.role)}
                      >
                        Cambiar a {user.role === 'admin' ? 'Usuario' : 'Admin'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Roles disponibles:</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Admin
                </dt>
                <dd className="ml-6 text-gray-600">
                  Acceso completo al sistema, incluido panel de administración
                </dd>
              </div>
              <div>
                <dt className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  Usuario
                </dt>
                <dd className="ml-6 text-gray-600">
                  Puede crear proyectos y configurar estaciones
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

