const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    isReady: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  currentQuestionIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
