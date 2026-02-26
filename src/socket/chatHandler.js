const { isRateLimited } = require("../services/rateLimiter");
const { activeSessions } = require("./matchmaking");
const pool = require('../config/db');

const MAX_MESSAGE_LENGTH = 300;

async function handleSendMessage(io, socket, message) {
    if (!message || typeof message !== 'string') return;

    if (isRateLimited(socket.id)) {
        socket.emit('error_message', {
            error: 'Too many messages. Slow down.',
        });
        return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        socket.emit('error_message', {
            error: 'Message too long',
        });
        return;
    }

    const partnerId = socket.activeChats?.get(socket.id);

    if (!partnerId) {
        socket.emit('error_message', {
            error: 'You are not connected to any partner',
        });
        return;
    }

    const partnerSocket = io.sockets.sockets.get(partnerId);

    if (!partnerSocket) return;

    const sessionId = socket.activeSessions?.get(socket.id);

    if (sessionId) {
        await pool.query(
            `INSERT INTO messages (session_id, sender_socket_id, message)
        VALUES (?, ?, ?)`,
            [sessionId, socket.id, message]
        );
    }

    partnerSocket.emit('receive_message', {
        message,
    });
}

module.exports = { handleSendMessage };