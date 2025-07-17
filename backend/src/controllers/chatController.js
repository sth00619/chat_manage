const openaiService = require('../services/openaiService');
const dataExtractor = require('../services/dataExtractor');
const UsageStat = require('../models/UsageStat');

class ChatController {
  async sendMessage(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.id;

      // Get AI response
      const aiResponse = await openaiService.getChatResponse(message, userId);

      // Save extracted data if any
      if (aiResponse.extractedData) {
        await dataExtractor.saveExtractedData(userId, aiResponse.extractedData);
      }

      // Log usage
      await UsageStat.create({
        user_id: userId,
        action_type: 'chat_message'
      });

      res.json({
        message: aiResponse.message,
        extractedData: aiResponse.extractedData
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ChatController();