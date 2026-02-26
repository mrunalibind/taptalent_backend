const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/stats', (req, res) => {
    res.json(getStats());
});

function getStats() {
    return {
        totalConnections,
        totalMatches,
        activeChats: activeChats.size / 2,
        waitingQueue: waitingQueue.length,
    };
}
    
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
    });
});

app.get('/', (req, res) => {
  res.json({ message: 'Anonymous Chat Backend Running' });
});

module.exports = app;