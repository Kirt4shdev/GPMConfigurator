import { Response } from 'express';
import { pool } from '../../db/pool';
import { AuthRequest } from '../../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const { type, montaje_permitido } = req.query;

    let query = 'SELECT * FROM sensors WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (montaje_permitido) {
      query += ` AND (montaje_permitido = $${paramIndex} OR montaje_permitido = 'ambos')`;
      params.push(montaje_permitido);
      paramIndex++;
    }

    query += ' ORDER BY brand, model';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get sensors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM sensors WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get sensor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const {
      id,
      brand,
      model,
      type,
      montaje_permitido,
      precio_base,
      allowed_hotspots,
      cable_pricing,
      docs,
      images,
      mediciones,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO sensors (
        id, brand, model, type, montaje_permitido, precio_base,
        allowed_hotspots_json, cable_pricing_json, docs_json, images_json, mediciones_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        id,
        brand,
        model,
        type,
        montaje_permitido,
        precio_base,
        JSON.stringify(allowed_hotspots || []),
        JSON.stringify(cable_pricing || []),
        JSON.stringify(docs || {}),
        JSON.stringify(images || {}),
        JSON.stringify(mediciones || []),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create sensor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      brand,
      model,
      type,
      montaje_permitido,
      precio_base,
      allowed_hotspots,
      cable_pricing,
      docs,
      images,
      mediciones,
    } = req.body;

    const result = await pool.query(
      `UPDATE sensors SET
        brand = $1, model = $2, type = $3, montaje_permitido = $4, precio_base = $5,
        allowed_hotspots_json = $6, cable_pricing_json = $7, docs_json = $8,
        images_json = $9, mediciones_json = $10
      WHERE id = $11 RETURNING *`,
      [
        brand,
        model,
        type,
        montaje_permitido,
        precio_base,
        JSON.stringify(allowed_hotspots || []),
        JSON.stringify(cable_pricing || []),
        JSON.stringify(docs || {}),
        JSON.stringify(images || {}),
        JSON.stringify(mediciones || []),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update sensor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM sensors WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json({ message: 'Sensor deleted' });
  } catch (error) {
    console.error('Delete sensor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

