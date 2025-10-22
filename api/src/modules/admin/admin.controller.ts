import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { pool } from '../../db/pool';

// Get all users (admin only)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['usuario', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent demoting yourself
    if (id === req.user?.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Export data (admin only)
export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    const [hotspots, sensors, panelOptions] = await Promise.all([
      pool.query('SELECT * FROM hotspots ORDER BY key'),
      pool.query('SELECT * FROM sensors ORDER BY id'),
      pool.query('SELECT * FROM panel_options ORDER BY id'),
    ]);

    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      exported_by: req.user?.email,
      data: {
        hotspots: hotspots.rows.map(row => ({
          key: row.key,
          x: parseFloat(row.x),
          y: parseFloat(row.y),
          label: row.label,
        })),
        sensors: sensors.rows.map(row => ({
          id: row.id,
          brand: row.brand,
          model: row.model,
          type: row.type,
          montaje_permitido: row.montaje_permitido,
          precio_base: parseFloat(row.precio_base),
          allowed_hotspots: row.allowed_hotspots_json,
          cable_pricing: row.cable_pricing_json,
          docs: row.docs_json,
          images: row.images_json,
          mediciones: row.mediciones_json,
        })),
        panel_options: panelOptions.rows.map(row => ({
          id: row.id,
          nombre: row.nombre,
          tipo: row.tipo,
          precio: parseFloat(row.precio),
          attrs: row.attrs_json,
        })),
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="gpm-configurador-export-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Import data (admin only)
export const importData = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { data } = req.body;
    let imported = { hotspots: 0, sensors: 0, panel_options: 0 };

    // Import hotspots
    if (data.hotspots && Array.isArray(data.hotspots)) {
      for (const hotspot of data.hotspots) {
        await client.query(
          `INSERT INTO hotspots (key, x, y, label) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (key) DO UPDATE 
           SET x = EXCLUDED.x, y = EXCLUDED.y, label = EXCLUDED.label`,
          [hotspot.key, hotspot.x, hotspot.y, hotspot.label || null]
        );
        imported.hotspots++;
      }
    }

    // Import sensors
    if (data.sensors && Array.isArray(data.sensors)) {
      for (const sensor of data.sensors) {
        await client.query(
          `INSERT INTO sensors (
            id, brand, model, type, montaje_permitido, precio_base,
            allowed_hotspots_json, cable_pricing_json, docs_json, images_json, mediciones_json
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            brand = EXCLUDED.brand,
            model = EXCLUDED.model,
            type = EXCLUDED.type,
            montaje_permitido = EXCLUDED.montaje_permitido,
            precio_base = EXCLUDED.precio_base,
            allowed_hotspots_json = EXCLUDED.allowed_hotspots_json,
            cable_pricing_json = EXCLUDED.cable_pricing_json,
            docs_json = EXCLUDED.docs_json,
            images_json = EXCLUDED.images_json,
            mediciones_json = EXCLUDED.mediciones_json`,
          [
            sensor.id,
            sensor.brand,
            sensor.model,
            sensor.type,
            sensor.montaje_permitido,
            sensor.precio_base,
            JSON.stringify(sensor.allowed_hotspots || []),
            JSON.stringify(sensor.cable_pricing || []),
            JSON.stringify(sensor.docs || {}),
            JSON.stringify(sensor.images || {}),
            JSON.stringify(sensor.mediciones || []),
          ]
        );
        imported.sensors++;
      }
    }

    // Import panel options
    if (data.panel_options && Array.isArray(data.panel_options)) {
      for (const option of data.panel_options) {
        await client.query(
          `INSERT INTO panel_options (id, nombre, tipo, precio, attrs_json)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             nombre = EXCLUDED.nombre,
             tipo = EXCLUDED.tipo,
             precio = EXCLUDED.precio,
             attrs_json = EXCLUDED.attrs_json`,
          [
            option.id,
            option.nombre,
            option.tipo,
            option.precio,
            JSON.stringify(option.attrs || {}),
          ]
        );
        imported.panel_options++;
      }
    }

    await client.query('COMMIT');
    res.json({ 
      success: true, 
      imported,
      message: `Imported ${imported.hotspots} hotspots, ${imported.sensors} sensors, ${imported.panel_options} panel options`
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// Get installation config
export const getInstallationConfig = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM installation_config WHERE id = $1',
      ['default']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }

    const config = result.rows[0];
    res.json({
      hq_city: config.hq_city,
      tarifa_diaria: parseFloat(config.tarifa_diaria),
      transporte_euros_km: parseFloat(config.transporte_euros_km),
      umbral_viaje_ida_km: config.umbral_viaje_ida_km,
      umbral_viaje_vuelta_km: config.umbral_viaje_vuelta_km,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update installation config
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
       WHERE id = 'default'
       RETURNING *`,
      [hq_city, tarifa_diaria, transporte_euros_km, umbral_viaje_ida_km, umbral_viaje_vuelta_km]
    );

    const config = result.rows[0];
    res.json({
      hq_city: config.hq_city,
      tarifa_diaria: parseFloat(config.tarifa_diaria),
      transporte_euros_km: parseFloat(config.transporte_euros_km),
      umbral_viaje_ida_km: config.umbral_viaje_ida_km,
      umbral_viaje_vuelta_km: config.umbral_viaje_vuelta_km,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get overview stats
export const getOverview = async (req: AuthRequest, res: Response) => {
  try {
    const [sensors, hotspots, panelOptions, projects, stations] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM sensors'),
      pool.query('SELECT COUNT(*) FROM hotspots'),
      pool.query('SELECT COUNT(*) FROM panel_options'),
      pool.query('SELECT COUNT(*) FROM projects'),
      pool.query('SELECT COUNT(*) FROM stations'),
    ]);

    res.json({
      sensors_count: parseInt(sensors.rows[0].count),
      hotspots_count: parseInt(hotspots.rows[0].count),
      panel_options_count: parseInt(panelOptions.rows[0].count),
      projects_count: parseInt(projects.rows[0].count),
      stations_count: parseInt(stations.rows[0].count),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

