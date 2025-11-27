import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';


import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import messageRoutes from './routes/messages';
import keyRoutes from './routes/keys';


import { errorHandler } from './middleware/errorHandler';


const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/keys', keyRoutes);


app.use(errorHandler);


export default app;
