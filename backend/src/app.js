import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimiter from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import { errorHandler } from './middleware/errorHandler.js';
import config from './config/index.js';
import healthcheck from '../healthcheck.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.use('/auth', rateLimiter, authRoutes);
app.use('/messages', messageRoutes);
app.use('/health', healthcheck);

// central error handling
app.use(errorHandler);

export default app;
