import http from 'http';
import express from 'express';
import { config } from './config/config';
import { connectMongo } from './config/mongo';
import app from './app';


const server = http.createServer(app);


async function startServer() {
try {
await connectMongo();
server.listen(config.port, () => {
console.log(`🚀 KMail server running on port ${config.port}`);
console.log(`📧 Environment: ${config.nodeEnv}`);
});
} catch (err) {
console.error('Failed to start server', err);
process.exit(1);
}
}


process.on('SIGTERM', () => {
console.log('SIGTERM received, closing server');
server.close(() => process.exit(0));
});


startServer();
