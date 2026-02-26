const { v4: uuidv4 } = require('uuid');
const { clearUser } = require('../services/rateLimiter');
const pool = require('../config/db');
let totalConnections = 0;
let totalMatches = 0;

const waitingQueue = [];
const activeChats = new Map();
const activeSessions = new Map();

function handleNewConnection(io, socket) {
    const userId = uuidv4();

    socket.data.userId = userId;

    console.log(`User connected: ${userId}`);

    socket.emit('session_created', { userId });

    totalConnections++;
    totalMatches++;
}

async function startSearching(io, socket) {
    if (activeChats.has(socket.id)) return;

    if (waitingQueue.length > 0) {
        const sessionId = uuidv4();
        const partnerSocket = waitingQueue.shift();

        await pool.query(
            `INSERT INTO chat_sessions (id, user1_socket_id, user2_socket_id) 
        VALUES (?, ?, ?)`,
            [sessionId, socket.id, partnerSocket.id]
        )

        activeChats.set(socket.id, partnerSocket.id);
        activeChats.set(partnerSocket.id, socket.id);

        activeSessions.set(socket.id, sessionId);
        activeSessions.set(partnerSocket.id, sessionId);

        socket.join(socket.id);
        partnerSocket.join(partnerSocket.id);

        socket.emit('matched');
        partnerSocket.emit('matched');

        console.log(`Matched ${socket.id} with ${partnerSocket.id}`);
    } else {
        if (!waitingQueue.find(s => s.id === socket.id)) {
            waitingQueue.push(socket);
        }
        socket.emit('searching');
    }
}

async function handleDisconnect(io, socket) {
    const partnerId = activeChats.get(socket.id);

    const sessionId = activeSessions.get(socket.id);

    if (sessionId) {
        await pool.query(
            `UPDATE chat_sessions SET ended_at = NOW() WHERE id = ?`,
            [sessionId]
        );

        activeSessions.delete(socket.id);

        if (partnerId){
            activeSessions.delete(partnerId);
        }
    }

    if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);

        if (partnerSocket) {
            partnerSocket.emit('partner_disconnected');
        }

        activeChats.delete(partnerId);
    }
    activeChats.delete(socket.id);

    const index = waitingQueue.findIndex(s => s.id === socket.id);
    if (index !== -1) {
        waitingQueue.splice(index, 1);
    }

    clearUser(socket.id);

    console.log(`Cleaned up user ${socket.id}`);
}

async function handleSkip(io, socket) {
    const partnerId = activeChats.get(socket.id);

    if (!partnerId) return;

    const partnerSocket = io.sockets.sockets.get(partnerId);

    // Remove chat mapping
    activeChats.delete(socket.id);
    activeChats.delete(partnerId);

    // Notify partner
    if (partnerSocket) {
        partnerSocket.emit('partner_skipped');
    }

    const sessionId = activeSessions.get(socket.id);

    if (sessionId) {
        await pool.query(
            `UPDATE chat_sessions SET ended_at = NOW() WHERE id = ?`,
            [sessionId]
        );

        activeSessions.delete(socket.id);
        activeSessions.delete(partnerId);
    }

    // Put skipper back to searching
    await startSearching(io, socket);

    console.log(`User ${socket.id} skipped chat`);
}

module.exports = {
    handleNewConnection,
    startSearching,
    handleDisconnect,
    handleSkip,
    activeChats,
    activeSessions,
};