-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'usuario' CHECK (role IN ('usuario', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotspots catalog (global)
CREATE TABLE IF NOT EXISTS hotspots (
  key VARCHAR(100) PRIMARY KEY,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  label VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sensors catalog
CREATE TABLE IF NOT EXISTS sensors (
  id VARCHAR(100) PRIMARY KEY,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  montaje_permitido VARCHAR(50) NOT NULL CHECK (montaje_permitido IN ('estacion', 'poa', 'ambos')),
  precio_base DECIMAL(10, 2) NOT NULL,
  allowed_hotspots_json JSONB NOT NULL DEFAULT '[]',
  cable_pricing_json JSONB NOT NULL DEFAULT '[]',
  docs_json JSONB NOT NULL DEFAULT '{}',
  images_json JSONB NOT NULL DEFAULT '{}',
  mediciones_json JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Panel options (datalogger, protections, etc.)
CREATE TABLE IF NOT EXISTS panel_options (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  attrs_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stations
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  provincia VARCHAR(255),
  latitud DECIMAL(10, 7),
  longitud DECIMAL(11, 7),
  hotspot_map_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Station sensor selections (one sensor per hotspot in station context)
CREATE TABLE IF NOT EXISTS station_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  sensor_id VARCHAR(100) NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  hotspot_key VARCHAR(100) NOT NULL,
  metros_cable DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(station_id, hotspot_key)
);

-- POAs (Plane of Array - can have multiple per station)
CREATE TABLE IF NOT EXISTS poas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  distancia_a_estacion_m DECIMAL(10, 2) NOT NULL DEFAULT 0,
  orientacion VARCHAR(50),
  inclinacion DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POA sensor selections
CREATE TABLE IF NOT EXISTS poa_sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poa_id UUID NOT NULL REFERENCES poas(id) ON DELETE CASCADE,
  sensor_id VARCHAR(100) NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  metros_cable DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Station panel options (many-to-many)
CREATE TABLE IF NOT EXISTS station_panel_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  panel_option_id VARCHAR(100) NOT NULL REFERENCES panel_options(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(station_id, panel_option_id)
);

-- Installation config (for admin)
CREATE TABLE IF NOT EXISTS installation_config (
  id VARCHAR(100) PRIMARY KEY,
  hq_city VARCHAR(255) NOT NULL DEFAULT 'Madrid',
  tarifa_diaria DECIMAL(10, 2) NOT NULL DEFAULT 350.00,
  transporte_euros_km DECIMAL(10, 2) NOT NULL DEFAULT 0.50,
  umbral_viaje_ida_km INT NOT NULL DEFAULT 200,
  umbral_viaje_vuelta_km INT NOT NULL DEFAULT 200,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default installation config
INSERT INTO installation_config (id, hq_city, tarifa_diaria, transporte_euros_km, umbral_viaje_ida_km, umbral_viaje_vuelta_km)
VALUES ('default', 'Madrid', 350.00, 0.50, 200, 200)
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_stations_project_id ON stations(project_id);
CREATE INDEX idx_station_selections_station_id ON station_selections(station_id);
CREATE INDEX idx_poas_station_id ON poas(station_id);
CREATE INDEX idx_poa_sensors_poa_id ON poa_sensors(poa_id);
CREATE INDEX idx_station_panel_options_station_id ON station_panel_options(station_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hotspots_updated_at BEFORE UPDATE ON hotspots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_panel_options_updated_at BEFORE UPDATE ON panel_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_station_selections_updated_at BEFORE UPDATE ON station_selections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_poas_updated_at BEFORE UPDATE ON poas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_poa_sensors_updated_at BEFORE UPDATE ON poa_sensors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_station_panel_options_updated_at BEFORE UPDATE ON station_panel_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_installation_config_updated_at BEFORE UPDATE ON installation_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

