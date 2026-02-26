-- create database if not exists anonymous_chat;
-- use anonymous_chat;

CREATE TABLE if not exists chat_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user1_socket_id VARCHAR(50),
    user2_socket_id VARCHAR(50),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL
);

CREATE TABLE if not exists messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36),
    sender_socket_id VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);