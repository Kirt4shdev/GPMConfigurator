import { Response } from 'express';
import { pool } from '../../db/pool';
import { AuthRequest } from '../../middleware/auth';

interface CablePricingTier {
  min_m: number;
  max_m: number;
  precio: number;
}

export const calculateCablePrice = async (req: AuthRequest, res: Response) => {
  try {
    const { sensor_id, metros } = req.query;

    if (!sensor_id || !metros) {
      return res.status(400).json({ error: 'sensor_id and metros are required' });
    }

    const metrosNum = parseFloat(metros as string);

    // Get sensor with cable pricing
    const result = await pool.query(
      'SELECT cable_pricing_json FROM sensors WHERE id = $1',
      [sensor_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    const cablePricing: CablePricingTier[] = result.rows[0].cable_pricing_json || [];

    // Calculate price based on tiers
    let totalPrice = 0;
    let remainingMeters = metrosNum;

    // Sort tiers by min_m
    const sortedTiers = [...cablePricing].sort((a, b) => a.min_m - b.min_m);

    for (const tier of sortedTiers) {
      if (remainingMeters <= 0) break;

      const tierRange = tier.max_m - tier.min_m;
      
      if (metrosNum > tier.min_m) {
        const metersInThisTier = Math.min(
          remainingMeters,
          Math.min(metrosNum, tier.max_m) - tier.min_m
        );
        
        if (metersInThisTier > 0) {
          totalPrice += tier.precio;
          remainingMeters -= metersInThisTier;
        }
      }
    }

    res.json({
      sensor_id,
      metros: metrosNum,
      precio_cable: totalPrice,
      tiers_used: sortedTiers.filter(t => metrosNum > t.min_m && metrosNum >= t.min_m),
    });
  } catch (error) {
    console.error('Calculate cable price error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Mock coordinates for Spanish provinces (simplified)
const provinciaCoords: Record<string, { lat: number; lon: number }> = {
  'Madrid': { lat: 40.4168, lon: -3.7038 },
  'Barcelona': { lat: 41.3851, lon: 2.1734 },
  'Valencia': { lat: 39.4699, lon: -0.3763 },
  'Sevilla': { lat: 37.3891, lon: -5.9845 },
  'Zaragoza': { lat: 41.6488, lon: -0.8891 },
  'Málaga': { lat: 36.7213, lon: -4.4214 },
  'Murcia': { lat: 37.9922, lon: -1.1307 },
  'Palma': { lat: 39.5696, lon: 2.6502 },
  'Las Palmas': { lat: 28.1248, lon: -15.4300 },
  'Bilbao': { lat: 43.2630, lon: -2.9350 },
};

export const estimateInstallation = async (req: AuthRequest, res: Response) => {
  try {
    const { provincia, num_estaciones } = req.query;

    if (!provincia || !num_estaciones) {
      return res.status(400).json({ error: 'provincia and num_estaciones are required' });
    }

    const numEstaciones = parseInt(num_estaciones as string);

    // Get installation config
    const configResult = await pool.query(
      'SELECT * FROM installation_config WHERE id = $1',
      ['default']
    );

    if (configResult.rows.length === 0) {
      return res.status(500).json({ error: 'Installation config not found' });
    }

    const config = configResult.rows[0];

    // Get HQ coordinates
    const hqCoords = provinciaCoords[config.hq_city] || provinciaCoords['Madrid'];
    const destCoords = provinciaCoords[provincia as string] || hqCoords;

    // Calculate distance
    const distanciaKm = calculateDistance(
      hqCoords.lat,
      hqCoords.lon,
      destCoords.lat,
      destCoords.lon
    );

    // Calculate travel days (viaje-contar rule)
    let diasIda = 0;
    let diasVuelta = 0;

    if (distanciaKm > 0) {
      diasIda = distanciaKm <= config.umbral_viaje_ida_km ? 0.5 : 1;
      diasVuelta = distanciaKm <= config.umbral_viaje_vuelta_km ? 0.5 : 1;
    }

    // Days for installation (1 day per station)
    const diasInstalacion = numEstaciones;

    // Total days
    const diasTotales = diasIda + diasInstalacion + diasVuelta;

    // Calculate costs
    const costoManoObra = diasTotales * parseFloat(config.tarifa_diaria);
    const costoTransporte = distanciaKm * 2 * parseFloat(config.transporte_euros_km); // Round trip

    const costoTotal = costoManoObra + costoTransporte;

    res.json({
      provincia,
      num_estaciones: numEstaciones,
      hq_city: config.hq_city,
      distancia_km: Math.round(distanciaKm * 10) / 10,
      dias_ida: diasIda,
      dias_vuelta: diasVuelta,
      dias_instalacion: diasInstalacion,
      dias_totales: diasTotales,
      tarifa_diaria: parseFloat(config.tarifa_diaria),
      costo_mano_obra: costoManoObra,
      costo_transporte: costoTransporte,
      costo_total: costoTotal,
    });
  } catch (error) {
    console.error('Estimate installation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInstallationConfig = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM installation_config WHERE id = $1',
      ['default']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Installation config not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get installation config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInstallationConfig = async (req: AuthRequest, res: Response) => {
  try {
    const {
      hq_city,
      tarifa_diaria,
      transporte_euros_km,
      umbral_viaje_ida_km,
      umbral_viaje_vuelta_km,
    } = req.body;

    const result = await pool.query(
      `UPDATE installation_config 
       SET hq_city = $1, tarifa_diaria = $2, transporte_euros_km = $3,
           umbral_viaje_ida_km = $4, umbral_viaje_vuelta_km = $5
       WHERE id = $6 RETURNING *`,
      [
        hq_city,
        tarifa_diaria,
        transporte_euros_km,
        umbral_viaje_ida_km,
        umbral_viaje_vuelta_km,
        'default',
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update installation config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

