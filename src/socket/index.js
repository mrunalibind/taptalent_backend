const { Server } = require('socket.io');
const { handleNewConnection, handleDisconnect, activeChats, handleSkip, startSearching, activeSessions, handleTyping, handleStopTyping } = require('./matchmaking');

const { handleSendMessage } = require('./chatHandler');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {

    socket.activeChats = activeChats;
    socket.activeSessions = activeSessions;

    handleNewConnection(io, socket);

    socket.on('start_search', async () => {
        await startSearching(io, socket);
    });

    socket.on('send_message', async (message) => {
      await handleSendMessage(io, socket, message);
    });

    socket.on('typing', () => {
        handleTyping(io, socket);
    });

    socket.on('stop_typing', () => {
        handleStopTyping(io, socket);
    });

    socket.on('skip', async () => {
        await handleSkip(io, socket);
    });

    socket.on('disconnect', async() => {
      await handleDisconnect(io, socket);
    });
  });
};

module.exports = { initSocket };