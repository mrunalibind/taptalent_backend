require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const initDatabase = require('./config/initDatabase');

const server = http.createServer(app);

async function startServer() {
  try {
    await initDatabase();
    initSocket(server);

    const PORT = process.env.PORT;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();