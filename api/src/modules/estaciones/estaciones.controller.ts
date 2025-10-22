import { Response } from 'express';
import { pool } from '../../db/pool';
import { AuthRequest } from '../../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.query;

    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    const result = await pool.query(
      'SELECT * FROM stations WHERE project_id = $1 ORDER BY created_at',
      [project_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get station
    const stationResult = await pool.query('SELECT * FROM stations WHERE id = $1', [id]);

    if (stationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const station = stationResult.rows[0];

    // Get selections
    const selectionsResult = await pool.query(
      `SELECT ss.*, s.brand, s.model, s.type, s.precio_base, s.cable_pricing_json
       FROM station_selections ss
       JOIN sensors s ON ss.sensor_id = s.id
       WHERE ss.station_id = $1`,
      [id]
    );

    // Get POAs
    const poasResult = await pool.query(
      `SELECT p.*, 
        json_agg(
          json_build_object(
            'id', ps.id,
            'sensor_id', ps.sensor_id,
            'metros_cable', ps.metros_cable,
            'sensor', json_build_object(
              'id', s.id,
              'brand', s.brand,
              'model', s.model,
              'type', s.type,
              'precio_base', s.precio_base,
              'cable_pricing_json', s.cable_pricing_json
            )
          )
        ) FILTER (WHERE ps.id IS NOT NULL) as sensors
       FROM poas p
       LEFT JOIN poa_sensors ps ON p.id = ps.poa_id
       LEFT JOIN sensors s ON ps.sensor_id = s.id
       WHERE p.station_id = $1
       GROUP BY p.id`,
      [id]
    );

    // Get panel options
    const panelOptionsResult = await pool.query(
      `SELECT spo.*, po.nombre, po.tipo, po.precio, po.attrs_json
       FROM station_panel_options spo
       JOIN panel_options po ON spo.panel_option_id = po.id
       WHERE spo.station_id = $1`,
      [id]
    );

    res.json({
      ...station,
      hotspot_map: station.hotspot_map_json || [],
      selections: selectionsResult.rows,
      poas: poasResult.rows,
      panel_options: panelOptionsResult.rows,
    });
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { project_id, name, provincia, latitud, longitud, hotspot_map } = req.body;

    const result = await pool.query(
      `INSERT INTO stations (project_id, name, provincia, latitud, longitud, hotspot_map_json)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [project_id, name, provincia, latitud, longitud, JSON.stringify(hotspot_map || [])]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, provincia, latitud, longitud } = req.body;

    const result = await pool.query(
      'UPDATE stations SET name = $1, provincia = $2, latitud = $3, longitud = $4 WHERE id = $5 RETURNING *',
      [name, provincia, latitud, longitud, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM stations WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json({ message: 'Station deleted' });
  } catch (error) {
    console.error('Delete station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateHotspotMap = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { hotspot_map } = req.body;

    const result = await pool.query(
      'UPDATE stations SET hotspot_map_json = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(hotspot_map), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update hotspot map error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addOrUpdateSelection = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sensor_id, hotspot_key, metros_cable } = req.body;

    // Check if selection already exists for this hotspot
    const existing = await pool.query(
      'SELECT id FROM station_selections WHERE station_id = $1 AND hotspot_key = $2',
      [id, hotspot_key]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE station_selections 
         SET sensor_id = $1, metros_cable = $2 
         WHERE station_id = $3 AND hotspot_key = $4 
         RETURNING *`,
        [sensor_id, metros_cable || 0, id, hotspot_key]
      );
    } else {
      // Insert new
      result = await pool.query(
        `INSERT INTO station_selections (station_id, sensor_id, hotspot_key, metros_cable)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [id, sensor_id, hotspot_key, metros_cable || 0]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add/update selection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeSelection = async (req: AuthRequest, res: Response) => {
  try {
    const { id, selectionId } = req.params;

    const result = await pool.query(
      'DELETE FROM station_selections WHERE id = $1 AND station_id = $2 RETURNING *',
      [selectionId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Selection not found' });
    }

    res.json({ message: 'Selection deleted' });
  } catch (error) {
    console.error('Delete selection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addPanelOption = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { panel_option_id, quantity } = req.body;

    const result = await pool.query(
      `INSERT INTO station_panel_options (station_id, panel_option_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (station_id, panel_option_id) 
       DO UPDATE SET quantity = EXCLUDED.quantity
       RETURNING *`,
      [id, panel_option_id, quantity || 1]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add panel option error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removePanelOption = async (req: AuthRequest, res: Response) => {
  try {
    const { id, panelOptionId } = req.params;

    const result = await pool.query(
      'DELETE FROM station_panel_options WHERE id = $1 AND station_id = $2 RETURNING *',
      [panelOptionId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Panel option not found' });
    }

    res.json({ message: 'Panel option deleted' });
  } catch (error) {
    console.error('Delete panel option error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

