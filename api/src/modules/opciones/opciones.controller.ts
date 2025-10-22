import { Response } from 'express';
import { pool } from '../../db/pool';
import { AuthRequest } from '../../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const { tipo } = req.query;

    let query = 'SELECT * FROM panel_options WHERE 1=1';
    const params: any[] = [];

    if (tipo) {
      query += ' AND tipo = $1';
      params.push(tipo);
    }

    query += ' ORDER BY tipo, nombre';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get panel options error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM panel_options WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Panel option not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get panel option error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { id, nombre, tipo, precio, attrs } = req.body;

    const result = await pool.query(
      'INSERT INTO panel_options (id, nombre, tipo, precio, attrs_json) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, nombre, tipo, precio, JSON.stringify(attrs || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create panel option error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, precio, attrs } = req.body;

    const result = await pool.query(
      'UPDATE panel_options SET nombre = $1, tipo = $2, precio = $3, attrs_json = $4 WHERE id = $5 RETURNING *',
      [nombre, tipo, precio, JSON.stringify(attrs || {}), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Panel option not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update panel option error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM panel_options WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Panel option not found' });
    }

    res.json({ message: 'Panel option deleted' });
  } catch (error) {
    console.error('Delete panel option error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

