import dotenv from 'dotenv';


dotenv.config();


export const config = {
nodeEnv: process.env.NODE_ENV || 'development',
port: parseInt(process.env.PORT || '3001', 10),
frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
database: {
url: process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/kmail'
},
jwt: {
secret: process.env.JWT_SECRET || 'change-me',
expiresIn: process.env.JWT_EXPIRES_IN || '7d'
},
crypto: {
algorithm: process.env.CRYPTO_ALGORITHM || 'kyber1024'
},
redis: {
url: process.env.REDIS_URL || 'redis://localhost:6379'
}
};
