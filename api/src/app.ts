import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import hotspotsRoutes from './modules/hotspots/hotspots.routes';
import sensoresRoutes from './modules/sensores/sensores.routes';
import opcionesRoutes from './modules/opciones/opciones.routes';
import proyectosRoutes from './modules/proyectos/proyectos.routes';
import estacionesRoutes from './modules/estaciones/estaciones.routes';
import poasRoutes from './modules/poas/poas.routes';
import helpersRoutes from './modules/helpers/helpers.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute (desarrollo)
  message: { error: 'Demasiadas peticiones, por favor intenta de nuevo más tarde' }
});
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotspots', hotspotsRoutes);
app.use('/api/sensores', sensoresRoutes);
app.use('/api/opciones-cuadro', opcionesRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/estaciones', estacionesRoutes);
app.use('/api/poas', poasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', helpersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;

