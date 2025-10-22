import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Loader2, CheckCircle2, AlertCircle, Package, Euro } from 'lucide-react';
import { WizardStationType } from '@/store/useWizardStore';

interface Step5Props {
  projectId: string;
  provincia: string;
  tipos: WizardStationType[];
  onComplete: () => void;
  onBack: () => void;
}

export const Step5_Summary = ({ projectId, provincia, tipos, onComplete, onBack }: Step5Props) => {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<any>(null);

  useEffect(() => {
    calculateEstimatedCost();
  }, []);

  const calculateEstimatedCost = async () => {
    setLoading(true);
    try {
      let totalSensors = 0;
      let totalCable = 0;
      let totalOptions = 0;
      let totalStations = 0;

      for (const tipo of tipos) {
        totalStations += tipo.cantidad;

        // Sensores de viento
        if (tipo.sensoresViento) {
          for (const sel of tipo.sensoresViento) {
            const sensor = await api.getSensor(sel.sensor_id);
            totalSensors += sensor.precio_unitario * tipo.cantidad;
            
            // Cable
            try {
              const cablePrice = await api.calculateCablePrice(sel.sensor_id, sel.metros_cable);
              totalCable += cablePrice.precio_total * tipo.cantidad;
            } catch (err) {
              // Si falla el cálculo de cable, ignorar
            }
          }
        }

        // Radiación horizontal
        if (tipo.radiacionHorizontal && tipo.sensorRadiacionHorizontal) {
          const sensor = await api.getSensor(tipo.sensorRadiacionHorizontal.sensor_id);
          totalSensors += sensor.precio_unitario * tipo.cantidad;
        }

        // Sensores en POAs
        if (tipo.poasConfig) {
          for (const poaConfig of tipo.poasConfig) {
            // Temperatura
            for (const temp of poaConfig.sensoresTemp || []) {
              const sensor = await api.getSensor(temp.sensor_id);
              totalSensors += sensor.precio_unitario * tipo.cantidad;
            }
            // Radiación
            for (const rad of poaConfig.sensoresRadiacion || []) {
              const sensor = await api.getSensor(rad.sensor_id);
              totalSensors += sensor.precio_unitario * tipo.cantidad;
            }
            // Ensuciamiento
            for (const soil of poaConfig.sensoresEnsuciamiento || []) {
              const sensor = await api.getSensor(soil.sensor_id);
              totalSensors += sensor.precio_unitario * tipo.cantidad;
            }
          }
        }

        // Opciones de cuadro
        if (tipo.datalogger) {
          const opt = await api.getPanelOption(tipo.datalogger);
          totalOptions += opt.precio_unitario * tipo.cantidad;
        }
        if (tipo.protecciones) {
          for (const prot of tipo.protecciones) {
            const opt = await api.getPanelOption(prot);
            totalOptions += opt.precio_unitario * tipo.cantidad;
          }
        }
        if (tipo.bateria) {
          const opt = await api.getPanelOption(tipo.bateria);
          totalOptions += opt.precio_unitario * tipo.cantidad;
        }
        if (tipo.kitSolar) {
          const opt = await api.getPanelOption(tipo.kitSolar);
          totalOptions += opt.precio_unitario * tipo.cantidad;
        }
      }

      // Instalación
      let installationCost = 0;
      try {
        const installation = await api.estimateInstallation(provincia, totalStations);
        installationCost = installation.coste_total || 0;
      } catch (err) {
        console.error('Error calculating installation:', err);
      }

      const total = totalSensors + totalCable + totalOptions + installationCost;
      setEstimatedCost(total);
      setCostBreakdown({
        sensores: totalSensors,
        cableado: totalCable,
        opciones: totalOptions,
        instalacion: installationCost,
      });
    } catch (error) {
      console.error('Error calculating cost:', error);
      setEstimatedCost(null);
    } finally {
      setLoading(false);
    }
  };

  const createConfigurations = async () => {
    setCreating(true);
    setError(null);
    setProgress('Iniciando creación de configuraciones...');

    try {
      for (let tipoIndex = 0; tipoIndex < tipos.length; tipoIndex++) {
        const tipo = tipos[tipoIndex];
        
        for (let i = 0; i < tipo.cantidad; i++) {
          setProgress(
            `Creando estación ${i + 1}/${tipo.cantidad} del tipo "${tipo.nombre}"...`
          );

          // Crear estación
          const stationName = tipo.cantidad > 1 
            ? `${tipo.nombre} #${i + 1}` 
            : tipo.nombre;

          const station = await api.createStation({
            project_id: projectId,
            name: stationName,
            provincia,
          });

          // Agregar sensores de viento a la estación
          if (tipo.sensoresViento) {
            for (const sel of tipo.sensoresViento) {
              await api.addStationSelection(station.id, {
                sensor_id: sel.sensor_id,
                hotspot_key: sel.hotspot_key,
                metros_cable: sel.metros_cable,
              });
            }
          }

          // Agregar radiación horizontal
          if (tipo.radiacionHorizontal && tipo.sensorRadiacionHorizontal) {
            await api.addStationSelection(station.id, {
              sensor_id: tipo.sensorRadiacionHorizontal.sensor_id,
              hotspot_key: tipo.sensorRadiacionHorizontal.hotspot_key,
              metros_cable: tipo.sensorRadiacionHorizontal.metros_cable,
            });
          }

          // Crear POAs
          if (tipo.poas && tipo.poas.length > 0) {
            for (let poaIndex = 0; poaIndex < tipo.poas.length; poaIndex++) {
              const poaDef = tipo.poas[poaIndex];
              const poaConfig = tipo.poasConfig?.[poaIndex];

              const poa = await api.createPOA({
                station_id: station.id,
                name: poaDef.nombre,
                distancia_a_estacion_m: poaDef.distancia_m,
              });

              if (poaConfig) {
                // Sensores de temperatura
                for (const temp of poaConfig.sensoresTemp || []) {
                  await api.addPOASensor(poa.id, {
                    sensor_id: temp.sensor_id,
                    metros_cable: temp.metros_cable,
                  });
                }

                // Sensores de radiación
                for (const rad of poaConfig.sensoresRadiacion || []) {
                  await api.addPOASensor(poa.id, {
                    sensor_id: rad.sensor_id,
                    metros_cable: rad.metros_cable,
                  });
                }

                // Sensores de ensuciamiento
                for (const soil of poaConfig.sensoresEnsuciamiento || []) {
                  await api.addPOASensor(poa.id, {
                    sensor_id: soil.sensor_id,
                    metros_cable: soil.metros_cable,
                  });
                }
              }
            }
          }

          // Agregar opciones de cuadro
          if (tipo.datalogger) {
            await api.addStationPanelOption(station.id, {
              option_id: tipo.datalogger,
            });
          }

          for (const prot of tipo.protecciones || []) {
            await api.addStationPanelOption(station.id, {
              option_id: prot,
            });
          }

          if (tipo.bateria) {
            await api.addStationPanelOption(station.id, {
              option_id: tipo.bateria,
            });
          }

          if (tipo.kitSolar) {
            await api.addStationPanelOption(station.id, {
              option_id: tipo.kitSolar,
            });
          }
        }
      }

      setProgress('¡Configuraciones creadas exitosamente!');
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating configurations:', err);
      setError(err.message || 'Error al crear las configuraciones');
      setCreating(false);
    }
  };

  const totalStations = tipos.reduce((sum, tipo) => sum + tipo.cantidad, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Resumen y Confirmación</h3>
        <p className="text-sm text-muted-foreground">
          Revise la configuración antes de crear las estaciones
        </p>
      </div>

      {/* Resumen por tipo */}
      <div className="space-y-4">
        {tipos.map((tipo) => (
          <div key={tipo.id} className="p-4 rounded-lg border bg-card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{tipo.nombre}</h4>
                <p className="text-sm text-muted-foreground">
                  {tipo.cantidad} {tipo.cantidad === 1 ? 'estación' : 'estaciones'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {/* Viento */}
              {tipo.sensoresViento && tipo.sensoresViento.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">• Viento:</span>
                  <span>
                    {tipo.tipoViento === 'multiparametrico' ? 'Multiparamétrico' : 'Analógico'} (
                    {tipo.sensoresViento.length} sensor{tipo.sensoresViento.length > 1 ? 'es' : ''})
                  </span>
                </div>
              )}

              {/* Radiación horizontal */}
              {tipo.radiacionHorizontal && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">• GHI:</span>
                  <span>Radiación horizontal</span>
                </div>
              )}

              {/* POAs */}
              {tipo.poas && tipo.poas.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">• POAs:</span>
                  <span>
                    {tipo.poas.length} POA{tipo.poas.length > 1 ? 's' : ''} configurados
                  </span>
                </div>
              )}

              {/* Cuadro eléctrico */}
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">• Cuadro:</span>
                <span>
                  Datalogger, {(tipo.protecciones || []).length} protección(es)
                  {tipo.bateria && ', batería'}
                  {tipo.kitSolar && ', kit solar'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estimación de costes */}
      <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Euro className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-2">Estimación de Coste</h4>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Calculando...</span>
              </div>
            ) : estimatedCost !== null ? (
              <div className="space-y-2">
                {costBreakdown && (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sensores:</span>
                      <span>€{costBreakdown.sensores.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cableado:</span>
                      <span>€{costBreakdown.cableado.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opciones:</span>
                      <span>€{costBreakdown.opciones.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Instalación:</span>
                      <span>€{costBreakdown.instalacion.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-2 border-t">
                      <span>Total (sin IVA):</span>
                      <span className="text-primary">€{estimatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No se pudo calcular el coste estimado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress / Error */}
      {creating && (
        <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/30">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{progress}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">Error</p>
              <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {progress.includes('exitosamente') && (
        <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-900 dark:text-green-100">{progress}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} disabled={creating}>
          Anterior
        </Button>
        <Button onClick={createConfigurations} disabled={creating} size="lg">
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            <>Crear {totalStations} Estación{totalStations > 1 ? 'es' : ''}</>
          )}
        </Button>
      </div>
    </div>
  );
};

