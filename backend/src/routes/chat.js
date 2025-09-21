const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const upload = require('../middleware/upload');

// POST /api/chat/ai
router.post('/ai', chatController.chatWithGemini);

// POST /api/chat/title
router.post('/title', chatController.suggestChatTitle);

// Add chat session and message storage endpoints
router.post('/session', chatController.createSession);
router.post('/message', chatController.saveMessage);
router.get('/:sessionId/messages', chatController.getMessages);
// Update chat session title
router.put('/session/:sessionId/title', chatController.updateSessionTitle);

// File upload endpoint
router.post('/upload', upload.single('file'), chatController.uploadFile);

module.exports = router; 