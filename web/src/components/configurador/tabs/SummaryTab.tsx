import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calculator } from 'lucide-react';

interface SummaryTabProps {
  station: any;
}

export const SummaryTab = ({ station }: SummaryTabProps) => {
  const [installationCost, setInstallationCost] = useState<any>(null);

  useEffect(() => {
    if (station.provincia) {
      loadInstallationCost();
    }
  }, [station.id, station.provincia]);

  const loadInstallationCost = async () => {
    try {
      const data = await api.estimateInstallation(station.provincia, 1);
      setInstallationCost(data);
    } catch (error) {
      console.error('Error loading installation cost:', error);
    }
  };

  const calculateCablePrice = (cablePricing: any[], metros: number) => {
    if (!cablePricing || cablePricing.length === 0) return 0;

    let total = 0;
    const sortedTiers = [...cablePricing].sort((a, b) => a.min_m - b.min_m);

    for (const tier of sortedTiers) {
      if (metros > tier.min_m) {
        const metersInTier = Math.min(metros, tier.max_m) - tier.min_m;
        if (metersInTier > 0) {
          total += tier.precio;
        }
      }
    }

    return total;
  };

  const calculateSensorTotal = (selection: any) => {
    const basePrice = parseFloat(selection.precio_base) || 0;
    const cablePrice = calculateCablePrice(selection.cable_pricing_json, selection.metros_cable);
    return basePrice + cablePrice;
  };

  const selections = station.selections || [];
  const panelOptions = station.panel_options || [];

  const subtotalSensors = selections.reduce(
    (sum: number, sel: any) => sum + calculateSensorTotal(sel),
    0
  );

  const subtotalPanel = panelOptions.reduce(
    (sum: number, opt: any) => sum + parseFloat(opt.precio) * opt.quantity,
    0
  );

  const subtotalEquipment = subtotalSensors + subtotalPanel;

  const subtotalInstallation = installationCost
    ? installationCost.costo_mano_obra + installationCost.costo_transporte
    : 0;

  const total = subtotalEquipment + subtotalInstallation;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Calculator className="w-5 h-5" />
        <h4 className="font-semibold">Resumen de Presupuesto</h4>
      </div>

      <div className="space-y-4">
        {/* Equipment */}
        <div>
          <h5 className="text-sm font-medium mb-2">Equipos</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Sensores ({selections.length})
              </span>
              <span>{subtotalSensors.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Cuadro eléctrico ({panelOptions.length})
              </span>
              <span>{subtotalPanel.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Subtotal Equipos</span>
              <span>{subtotalEquipment.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Installation */}
        <div>
          <h5 className="text-sm font-medium mb-2">Instalación</h5>
          {installationCost ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Mano de obra ({installationCost.dias_totales} días)
                </span>
                <span>{installationCost.costo_mano_obra.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Transporte ({installationCost.distancia_km} km)
                </span>
                <span>{installationCost.costo_transporte.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Subtotal Instalación</span>
                <span>{subtotalInstallation.toFixed(2)} €</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Configure la provincia de la estación
            </p>
          )}
        </div>

        {/* Total */}
        <div className="pt-4 border-t-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Total (sin impuestos)</span>
            <span className="text-primary">{total.toFixed(2)} €</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            IVA no incluido
          </p>
        </div>

        {installationCost && (
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>
              <strong>Desglose instalación:</strong>
            </p>
            <p>• Ida: {installationCost.dias_ida} días</p>
            <p>• Instalación: {installationCost.dias_instalacion} días</p>
            <p>• Vuelta: {installationCost.dias_vuelta} días</p>
            <p>• Tarifa diaria: {installationCost.tarifa_diaria} €</p>
          </div>
        )}
      </div>
    </div>
  );
};

