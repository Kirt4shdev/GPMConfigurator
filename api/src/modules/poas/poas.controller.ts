import { Response } from 'express';
import { pool } from '../../db/pool';
import { AuthRequest } from '../../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const { station_id } = req.query;

    if (!station_id) {
      return res.status(400).json({ error: 'station_id is required' });
    }

    const poasResult = await pool.query(
      'SELECT * FROM poas WHERE station_id = $1 ORDER BY created_at',
      [station_id]
    );

    // Get sensors for each POA
    const poasWithSensors = await Promise.all(
      poasResult.rows.map(async (poa) => {
        const sensorsResult = await pool.query(
          `SELECT ps.*, s.brand, s.model, s.type, s.precio_base, s.cable_pricing_json
           FROM poa_sensors ps
           JOIN sensors s ON ps.sensor_id = s.id
           WHERE ps.poa_id = $1`,
          [poa.id]
        );
        return {
          ...poa,
          sensors: sensorsResult.rows.map((row) => ({
            ...row,
            sensor: {
              id: row.sensor_id,
              brand: row.brand,
              model: row.model,
              type: row.type,
              precio_base: row.precio_base,
              cable_pricing_json: row.cable_pricing_json,
            },
          })),
        };
      })
    );

    res.json(poasWithSensors);
  } catch (error) {
    console.error('Get POAs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const poaResult = await pool.query('SELECT * FROM poas WHERE id = $1', [id]);

    if (poaResult.rows.length === 0) {
      return res.status(404).json({ error: 'POA not found' });
    }

    // Get sensors
    const sensorsResult = await pool.query(
      `SELECT ps.*, s.brand, s.model, s.type, s.precio_base, s.cable_pricing_json
       FROM poa_sensors ps
       JOIN sensors s ON ps.sensor_id = s.id
       WHERE ps.poa_id = $1`,
      [id]
    );

    res.json({
      ...poaResult.rows[0],
      sensors: sensorsResult.rows,
    });
  } catch (error) {
    console.error('Get POA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { station_id, nombre, distancia_a_estacion_m, orientacion, inclinacion } = req.body;

    const result = await pool.query(
      `INSERT INTO poas (station_id, nombre, distancia_a_estacion_m, orientacion, inclinacion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [station_id, nombre, distancia_a_estacion_m || 0, orientacion, inclinacion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create POA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, distancia_a_estacion_m, orientacion, inclinacion } = req.body;

    const result = await pool.query(
      `UPDATE poas 
       SET nombre = $1, distancia_a_estacion_m = $2, orientacion = $3, inclinacion = $4 
       WHERE id = $5 RETURNING *`,
      [nombre, distancia_a_estacion_m, orientacion, inclinacion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'POA not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update POA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM poas WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'POA not found' });
    }

    res.json({ message: 'POA deleted' });
  } catch (error) {
    console.error('Delete POA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addSensor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sensor_id, metros_cable } = req.body;

    const result = await pool.query(
      'INSERT INTO poa_sensors (poa_id, sensor_id, metros_cable) VALUES ($1, $2, $3) RETURNING *',
      [id, sensor_id, metros_cable || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add POA sensor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSensor = async (req: AuthRequest, res: Response) => {
  try {
    const { id, sensorId } = req.params;
    const { metros_cable } = req.body;

    const result = await pool.query(
      'UPDATE poa_sensors SET metros_cable = $1 WHERE id = $2 AND poa_id = $3 RETURNING *',
      [metros_cable, sensorId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'POA sensor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update POA sensor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeSensor = async (req: AuthRequest, res: Response) => {
  try {
    const { id, sensorId } = req.params;

    const result = await pool.query(
      'DELETE FROM poa_sensors WHERE id = $1 AND poa_id = $2 RETURNING *',
      [sensorId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'POA sensor not found' });
    }

    res.json({ message: 'POA sensor deleted' });
  } catch (error) {
    console.error('Delete POA sensor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

