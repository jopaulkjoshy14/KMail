import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/utils/db.js';
import config from './src/config/index.js';

dotenv.config();

const { PORT } = config;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`KMail backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
