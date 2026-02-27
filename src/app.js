const express = require('express');
const cors = require('cors');
const { activeChats, waitingQueue, getTotalConnections, getTotalMatches } = require('./socket/matchmaking');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/stats', (req, res) => {
    res.json(getStats());
});

// getStats to get the infomation about users status
function getStats() {
    return {
        totalConnections: getTotalConnections(),
        totalMatches: getTotalMatches(),
        activeChats: activeChats.size / 2,
        waitingQueue: waitingQueue.length,
    };
}
 
// to check if the server is running or not
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