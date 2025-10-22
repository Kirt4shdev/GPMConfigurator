import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const AdminReglasInstalacion = () => {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testProvincia, setTestProvincia] = useState('Madrid');
  const [testEstaciones, setTestEstaciones] = useState(1);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.getInstallationConfig();
      setConfig(data);
    } catch (error: any) {
      alert('Error al cargar configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const data = {
      hq_city: formData.get('hq_city') as string,
      tarifa_diaria: parseFloat(formData.get('tarifa_diaria') as string),
      transporte_euros_km: parseFloat(formData.get('transporte_euros_km') as string),
      umbral_viaje_ida_km: parseInt(formData.get('umbral_viaje_ida_km') as string),
      umbral_viaje_vuelta_km: parseInt(formData.get('umbral_viaje_vuelta_km') as string),
    };

    try {
      await api.updateInstallationConfig(data);
      alert('Configuración actualizada');
      await loadConfig();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleTest = async () => {
    try {
      const result = await api.estimateInstallation(testProvincia, testEstaciones);
      setTestResult(result);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Reglas de Instalación</h2>
        <p className="text-sm text-gray-600">Configura umbrales, tarifas y transporte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Ciudad HQ *</Label>
                <Input name="hq_city" required defaultValue={config?.hq_city || 'Madrid'} />
              </div>
              <div>
                <Label>Tarifa diaria técnico (€) *</Label>
                <Input name="tarifa_diaria" type="number" step="0.01" required defaultValue={config?.tarifa_diaria || ''} />
              </div>
              <div>
                <Label>Transporte (€/km) *</Label>
                <Input name="transporte_euros_km" type="number" step="0.01" required defaultValue={config?.transporte_euros_km || ''} />
              </div>
              <div>
                <Label>Umbral viaje ida (km) *</Label>
                <Input name="umbral_viaje_ida_km" type="number" required defaultValue={config?.umbral_viaje_ida_km || ''} />
              </div>
              <div>
                <Label>Umbral viaje vuelta (km) *</Label>
                <Input name="umbral_viaje_vuelta_km" type="number" required defaultValue={config?.umbral_viaje_vuelta_km || ''} />
              </div>
              <Button type="submit" className="w-full">Guardar Configuración</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prueba de Estimación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Provincia</Label>
              <Input value={testProvincia} onChange={(e) => setTestProvincia(e.target.value)} />
            </div>
            <div>
              <Label>Número de estaciones</Label>
              <Input type="number" value={testEstaciones} onChange={(e) => setTestEstaciones(parseInt(e.target.value))} />
            </div>
            <Button onClick={handleTest} className="w-full">Calcular Estimación</Button>

            {testResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Resultado:</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt>Distancia:</dt>
                    <dd className="font-medium">{testResult.distancia_km} km</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Días:</dt>
                    <dd className="font-medium">{testResult.dias}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Mano de obra:</dt>
                    <dd className="font-medium">{testResult.mano_obra}€</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Transporte:</dt>
                    <dd className="font-medium">{testResult.transporte}€</dd>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <dt className="font-semibold">Total:</dt>
                    <dd className="font-bold">{testResult.total}€</dd>
                  </div>
                </dl>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

