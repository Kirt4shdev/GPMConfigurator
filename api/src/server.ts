import app from './app';
import { env } from './config/env';
import { pool } from './db/pool';

const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected');

    // Start server
    app.listen(env.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 GPM Configurador API                        ║
║                                                   ║
║   Environment: ${env.nodeEnv.padEnd(33)}║
║   Port:        ${env.port.toString().padEnd(33)}║
║   API:         http://localhost:${env.port.toString().padEnd(18)}║
║   Docs:        http://localhost:${env.port.toString()}/docs${' '.padEnd(13)}║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

