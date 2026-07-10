const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

// Entry point — connect to the database, then start the Express server.
async function start() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`   Health check: http://localhost:${env.PORT}/api/v1/health`);
  });
}

start();
