import { Response } from 'express';
import { pool } from '../../db/pool';
import { AuthRequest } from '../../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    let query = 'SELECT * FROM projects';
    const params: any[] = [];

    if (!isAdmin) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    let query = 'SELECT * FROM projects WHERE id = $1';
    const params: any[] = [id];

    if (!isAdmin) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, client_name, client_email } = req.body;
    const userId = req.user!.id;

    const result = await pool.query(
      'INSERT INTO projects (name, description, client_name, client_email, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, client_name, client_email, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, client_name, client_email } = req.body;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    let query = 'UPDATE projects SET name = $1, description = $2, client_name = $3, client_email = $4 WHERE id = $5';
    const params: any[] = [name, description, client_name, client_email, id];

    if (!isAdmin) {
      query += ' AND user_id = $6';
      params.push(userId);
    }

    query += ' RETURNING *';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    let query = 'DELETE FROM projects WHERE id = $1';
    const params: any[] = [id];

    if (!isAdmin) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    query += ' RETURNING *';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

