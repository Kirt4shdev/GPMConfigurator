import { Response } from 'express';
import { pool } from '../../db/pool';
import { AuthRequest } from '../../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM hotspots ORDER BY key');
    res.json(result.rows);
  } catch (error) {
    console.error('Get hotspots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { key, x, y, label } = req.body;

    const result = await pool.query(
      'INSERT INTO hotspots (key, x, y, label) VALUES ($1, $2, $3, $4) RETURNING *',
      [key, x, y, label]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create hotspot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { x, y, label } = req.body;

    // Validate coordinates
    if (x === undefined || y === undefined) {
      return res.status(400).json({ error: 'x and y coordinates are required' });
    }

    const result = await pool.query(
      'UPDATE hotspots SET x = $1, y = $2, label = $3, updated_at = CURRENT_TIMESTAMP WHERE key = $4 RETURNING *',
      [parseFloat(x), parseFloat(y), label || null, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotspot not found' });
    }

    console.log(`✓ Hotspot ${key} updated to (${x}, ${y})`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update hotspot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;

    const result = await pool.query('DELETE FROM hotspots WHERE key = $1 RETURNING *', [key]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotspot not found' });
    }

    res.json({ message: 'Hotspot deleted' });
  } catch (error) {
    console.error('Delete hotspot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

