import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Download, Upload, FileJson } from 'lucide-react';

export const AdminImportExport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gpm-configurador-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Datos exportados correctamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      if (!json.data) {
        throw new Error('Formato de archivo inválido');
      }

      await api.importData(json.data);
      alert(`Importación completada exitosamente`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Import/Export de Datos</h2>
        <p className="text-sm text-gray-600">Gestiona copias de seguridad del catálogo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Descarga un archivo JSON con todos los sensores, hotspots y opciones de cuadro.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Incluye:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Todos los sensores del catálogo</li>
                <li>• Todas las posiciones de hotspots</li>
                <li>• Todas las opciones de cuadro</li>
              </ul>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar Datos'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Importa datos desde un archivo JSON. Los registros existentes serán actualizados.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 text-yellow-800">⚠️ Importante:</h4>
              <ul className="text-sm space-y-1 text-yellow-700">
                <li>• Los datos se upsertean (insert o update)</li>
                <li>• No se eliminan registros existentes</li>
                <li>• Verifica el formato antes de importar</li>
              </ul>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
                id="file-import"
              />
              <label htmlFor="file-import">
                <Button
                  type="button"
                  disabled={isImporting}
                  className="w-full"
                  onClick={() => document.getElementById('file-import')?.click()}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importando...' : 'Seleccionar Archivo'}
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Formato del Archivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            El archivo JSON debe tener la siguiente estructura:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "version": "1.0",
  "exported_at": "2025-10-22T12:00:00.000Z",
  "data": {
    "hotspots": [...],
    "sensors": [...],
    "panel_options": [...]
  }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

