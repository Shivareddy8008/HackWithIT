require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { dbName: 'quizio' })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io for Real-time Leaderboard & Multiplayer Rooms
const Room = require('./models/Room');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Global leaderboard
  socket.on('join_global', async () => {
    socket.join('global_room');
    const users = await User.find().sort({ totalScore: -1 }).limit(10);
    socket.emit('leaderboard_update', users);
  });

  // Multiplayer Room Logic
  socket.on('join_room', async ({ roomCode, userId }) => {
    socket.join(roomCode);
    const room = await Room.findOne({ roomCode }).populate('players.userId', 'username avatarId');
    if (room) {
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on('start_quiz', async ({ roomCode }) => {
    const room = await Room.findOneAndUpdate({ roomCode }, { status: 'playing' }, { new: true });
    io.to(roomCode).emit('quiz_started');
  });

  socket.on('room_score_update', async ({ roomCode, userId, points }) => {
    try {
      // Update global score
      const user = await User.findById(userId);
      if (user) {
        user.totalScore += points;
        await user.save();
      }
      
      // Update room score
      const room = await Room.findOne({ roomCode });
      if (room) {
        const player = room.players.find(p => p.userId.toString() === userId);
        if (player) player.score += points;
        await room.save();
        
        const populatedRoom = await Room.findOne({ roomCode }).populate('players.userId', 'username avatarId');
        io.to(roomCode).emit('room_updated', populatedRoom);
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
