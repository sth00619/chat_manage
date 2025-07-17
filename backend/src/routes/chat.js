const router = require('express').Router();
const chatController = require('../controllers/chatController');
const { authenticateJWT } = require('../middlewares/auth');

// All chat routes require authentication
router.use(authenticateJWT);

// Send message to AI assistant
router.post('/message', chatController.sendMessage);

module.exports = router;