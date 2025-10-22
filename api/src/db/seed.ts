import fs from 'fs';
import path from 'path';
import { pool } from './pool';
import bcrypt from 'bcrypt';

interface Hotspot {
  key: string;
  x: number;
  y: number;
  label?: string;
}

interface Sensor {
  id: string;
  brand: string;
  model: string;
  type: string;
  precio_base: number;
  allowed_hotspots: string[];
  montaje_permitido: string;
  cable_pricing: any[];
  docs: any;
  images: any;
  mediciones?: string[];
}

interface PanelOption {
  id: string;
  nombre: string;
  tipo: string;
  precio: number;
  attrs: any;
}

interface SeedData {
  meta: any;
  hotspots: Hotspot[];
  sensors: Sensor[];
  opciones_cuadro: PanelOption[];
}

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    // Read seed JSON
    const seedPath = path.join(__dirname, '../../../seed/seed_sensores_opciones.json');
    const seedData: SeedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

    // 1. Seed hotspots
    console.log('  → Seeding hotspots...');
    for (const hotspot of seedData.hotspots) {
      await pool.query(
        `INSERT INTO hotspots (key, x, y, label)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE SET
           x = EXCLUDED.x,
           y = EXCLUDED.y,
           label = EXCLUDED.label`,
        [hotspot.key, hotspot.x, hotspot.y, hotspot.label || null]
      );
    }
    console.log(`  ✓ Inserted ${seedData.hotspots.length} hotspots`);

    // 2. Seed sensors
    console.log('  → Seeding sensors...');
    for (const sensor of seedData.sensors) {
      await pool.query(
        `INSERT INTO sensors (
           id, brand, model, type, montaje_permitido, precio_base,
           allowed_hotspots_json, cable_pricing_json, docs_json, images_json, mediciones_json
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
          JSON.stringify(sensor.allowed_hotspots),
          JSON.stringify(sensor.cable_pricing),
          JSON.stringify(sensor.docs),
          JSON.stringify(sensor.images),
          JSON.stringify(sensor.mediciones || [])
        ]
      );
    }
    console.log(`  ✓ Inserted ${seedData.sensors.length} sensors`);

    // 3. Seed panel options
    console.log('  → Seeding panel options...');
    for (const option of seedData.opciones_cuadro) {
      await pool.query(
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
          JSON.stringify(option.attrs)
        ]
      );
    }
    console.log(`  ✓ Inserted ${seedData.opciones_cuadro.length} panel options`);

    // 4. Create default admin user
    console.log('  → Creating default admin user...');
    const adminEmail = 'admin@gpm.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, hashedPassword, 'Administrator', 'admin']
    );
    console.log(`  ✓ Admin user created (${adminEmail} / ${adminPassword})`);

    // 5. Create default user
    console.log('  → Creating default user...');
    const userEmail = 'user@gpm.com';
    const userPassword = 'user123';
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);

    await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [userEmail, hashedUserPassword, 'Usuario Demo', 'usuario']
    );
    console.log(`  ✓ Demo user created (${userEmail} / ${userPassword})`);

    console.log('✅ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

