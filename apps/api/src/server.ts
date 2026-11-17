import http from 'http';
import { createApp } from './app';
import { ENV } from './config/env';
import { initSocketIO } from './socket';
import { connectToMongoDB, disconnectMongoDB } from './db/mongo';
import { db } from './db';

const app = createApp();
const server = http.createServer(app);

// Attach Socket.io
initSocketIO(server);

async function startServer() {
  // Attempt MongoDB Atlas connection
  const mongoConnected = await connectToMongoDB();
  if (mongoConnected) {
    await db.loadFromAtlas();
  }

  server.listen(ENV.PORT, () => {
    console.log(`=========================================`);
    console.log(`  Roomie API Server running on port ${ENV.PORT}`);
    console.log(`  Environment: ${ENV.NODE_ENV}`);
    console.log(`  Database: ${mongoConnected ? 'MongoDB Atlas (Connected)' : 'Local File Fallback'}`);
    console.log(`  Healthcheck: http://localhost:${ENV.PORT}/health`);
    console.log(`=========================================`);
  });
}

startServer();

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down Roomie API gracefully...');
  await disconnectMongoDB();
  server.close(() => {
    console.log('HTTP and Socket server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
