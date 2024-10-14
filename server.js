import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('create-room', () => {
    const roomId = uuidv4();
    rooms.set(roomId, { participants: new Set() });
    socket.emit('room-created', roomId);
  });

  socket.on('join-room', (roomId, userId) => {
    if (rooms.has(roomId)) {
      socket.join(roomId);
      rooms.get(roomId).participants.add(userId);
      socket.to(roomId).emit('user-connected', userId);
      
      socket.on('disconnect', () => {
        rooms.get(roomId).participants.delete(userId);
        socket.to(roomId).emit('user-disconnected', userId);
        if (rooms.get(roomId).participants.size === 0) {
          rooms.delete(roomId);
        }
      });
    }
  });

  socket.on('send-chat-message', (roomId, message) => {
    socket.to(roomId).emit('chat-message', message);
  });

  socket.on('toggle-audio', (roomId, userId, enabled) => {
    socket.to(roomId).emit('user-audio-toggle', userId, enabled);
  });

  socket.on('toggle-video', (roomId, userId, enabled) => {
    socket.to(roomId).emit('user-video-toggle', userId, enabled);
  });

  socket.on('spotlight-user', (roomId, userId) => {
    socket.to(roomId).emit('user-spotlighted', userId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});