const express = require('express');
const { generateQuiz } = require('../services/gemini');
const Quiz = require('../models/Quiz');
const Room = require('../models/Room');
const crypto = require('crypto');

const router = express.Router();

// Get available categories
router.get('/categories', async (req, res) => {
  const categories = [
    { id: 1, name: 'General Knowledge', icon: '🌍', image: '/categories/general.png' },
    { id: 2, name: 'Science', icon: '🔬', image: '/categories/science.png' },
    { id: 3, name: 'Sports', icon: '⚽', image: '/categories/sports.png' },
    { id: 4, name: 'Movies', icon: '🎬', image: '/categories/movies.png' },
    { id: 5, name: 'Technology', icon: '💻', image: '/categories/technology.png' },
    { id: 6, name: 'History', icon: '📜', image: '/categories/history.png' },
    { id: 7, name: 'Geography', icon: '🗺️', image: '/categories/geography.png' },
    { id: 8, name: 'Music', icon: '🎵', image: '/categories/music.png' }
  ];
  res.json(categories);
});

// Generate a fresh quiz for a category (always new questions)
router.post('/start', async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'Category required' });

  try {
    console.log(`Generating new quiz for ${category} using Gemini...`);
    const generatedQuiz = await generateQuiz(category);
    const quiz = new Quiz({
      category: generatedQuiz.category,
      title: generatedQuiz.title,
      questions: generatedQuiz.questions
    });
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

// --- Custom Quizzes ---

router.post('/create', async (req, res) => {
  try {
    const { category, title, questions, creatorId } = req.body;
    const quiz = new Quiz({ category, title, questions, creatorId });
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

router.get('/my-quizzes/:userId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ creatorId: req.params.userId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// --- Multiplayer Rooms ---

// Get all public waiting rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'waiting' })
      .populate('hostId', 'username')
      .populate('quizId', 'category title')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Create a room (requires an existing quizId)
router.post('/room/create', async (req, res) => {
  try {
    const { quizId, hostId } = req.body;
    const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const room = new Room({
      roomCode,
      quizId,
      hostId,
      players: [{ userId: hostId }]
    });
    await room.save();
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Create a room with AI quiz generation in one step
router.post('/room/create-with-quiz', async (req, res) => {
  try {
    const { hostId, category } = req.body;
    const cat = category || 'General Knowledge';
    
    // Generate quiz via Gemini
    console.log(`Generating quiz for room: ${cat}...`);
    const generatedQuiz = await generateQuiz(cat);
    const quiz = new Quiz({
      category: generatedQuiz.category,
      title: generatedQuiz.title,
      questions: generatedQuiz.questions
    });
    await quiz.save();
    
    // Create room
    const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const room = new Room({
      roomCode,
      quizId: quiz._id,
      hostId,
      players: [{ userId: hostId }]
    });
    await room.save();
    
    res.json({ room, quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.post('/room/join', async (req, res) => {
  try {
    const { roomCode, userId } = req.body;
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status !== 'waiting') return res.status(400).json({ error: 'Room already started' });
    
    if (!room.players.find(p => p.userId.toString() === userId)) {
      room.players.push({ userId });
      await room.save();
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to join room' });
  }
});

router.get('/room/:roomCode', async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode })
      .populate('players.userId', 'username avatarId')
      .populate('quizId');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

module.exports = router;
