const MESSAGE_LIMIT = 5;
const TIME_WINDOW = 3000; // 3 seconds

const messageTracker = new Map();

function isRateLimited(socketId) {
  const now = Date.now();

  if (!messageTracker.has(socketId)) {
    messageTracker.set(socketId, []);
  }

  const timestamps = messageTracker.get(socketId);

  // Remove old timestamps
  while (timestamps.length && now - timestamps[0] > TIME_WINDOW) {
    timestamps.shift();
  }

  if (timestamps.length >= MESSAGE_LIMIT) {
    return true;
  }

  timestamps.push(now);
  return false;
}

function clearUser(socketId) {
  messageTracker.delete(socketId);
}

module.exports = { isRateLimited, clearUser };