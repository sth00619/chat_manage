const openaiService = require('../services/openaiService');
const dataExtractor = require('../services/dataExtractor');
const queryService = require('../services/queryService');
const UsageStat = require('../models/UsageStat');

class ChatController {
  async sendMessage(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.id;

      console.log(`[ChatController] Received message from user ${userId}: ${message}`);

      // Check if message is a query/search request
      const queryIntent = await detectQueryIntent(message);
      console.log('[ChatController] Query intent:', queryIntent);
      
      if (queryIntent.isQuery) {
        // Handle query request
        console.log('[ChatController] Processing as query...');
        const queryResults = await queryService.executeQuery(userId, queryIntent);
        
        // Log usage
        await UsageStat.create({
          user_id: userId,
          action_type: 'data_query'
        });

        console.log('[ChatController] Sending query response');
        res.json({
          message: queryResults.message,
          data: queryResults.data,
          type: 'query'
        });
      } else {
        // Get AI response for data extraction
        console.log('[ChatController] Processing with OpenAI...');
        const aiResponse = await openaiService.getChatResponse(message, userId);
        console.log('[ChatController] OpenAI response received:', {
          hasMessage: !!aiResponse.message,
          hasExtractedData: !!aiResponse.extractedData
        });

        // Save extracted data if any
        if (aiResponse.extractedData) {
          console.log('[ChatController] Saving extracted data...');
          await dataExtractor.saveExtractedData(userId, aiResponse.extractedData);
        }

        // Log usage
        await UsageStat.create({
          user_id: userId,
          action_type: 'chat_message'
        });

        console.log('[ChatController] Sending chat response');
        res.json({
          message: aiResponse.message,
          extractedData: aiResponse.extractedData,
          type: 'extraction'
        });
      }
    } catch (error) {
      console.error('[ChatController] Chat error:', error);
      console.error('[ChatController] Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}

// Helper function outside the class
async function detectQueryIntent(message) {
  const queryKeywords = [
    // Korean - 더 구체적인 패턴
    { pattern: /내\s*(일정|스케줄)/i, type: 'schedules' },
    { pattern: /일정\s*(조회|찾아|검색|보여|알려|확인|뭐\s*있)/i, type: 'schedules' },
    { pattern: /(\d{1,2})월\s*(일정|스케줄)/i, type: 'schedules' },
    { pattern: /(오늘|내일|어제|이번\s*주|다음\s*주|지난\s*주)\s*(일정|스케줄|뭐\s*있|뭐가\s*있)/i, type: 'schedules' },
    
    { pattern: /내\s*(연락처|전화번호|이메일)/i, type: 'contacts' },
    { pattern: /연락처\s*(조회|찾아|검색|보여|알려|확인|목록)/i, type: 'contacts' },
    
    { pattern: /내\s*(목표|계획)/i, type: 'goals' },
    { pattern: /목표\s*(조회|찾아|검색|보여|알려|확인|목록)/i, type: 'goals' },
    
    // English patterns
    { pattern: /my\s+(schedule|appointment|event)/i, type: 'schedules' },
    { pattern: /show\s+.*\s*(schedule|appointment|event)/i, type: 'schedules' },
    { pattern: /my\s+(contact|phone|email)/i, type: 'contacts' },
    { pattern: /my\s+(goal|objective|plan)/i, type: 'goals' }
  ];

  const messageLower = message.toLowerCase();
  
  // Extract query parameters
  const queryIntent = {
    isQuery: false,
    type: null,
    timeframe: null,
    category: null
  };

  // Check for specific query patterns
  for (const keyword of queryKeywords) {
    if (keyword.pattern.test(message)) {
      queryIntent.isQuery = true;
      queryIntent.type = keyword.type;
      break;
    }
  }

  // Only process timeframe if it's actually a query
  if (queryIntent.isQuery) {
    // Detect timeframe
    const monthMatch = message.match(/(\d{1,2})월/);
    if (monthMatch) {
      queryIntent.timeframe = {
        month: parseInt(monthMatch[1])
      };
    }

    // Detect year
    const yearMatch = message.match(/(\d{4})년/);
    if (yearMatch) {
      queryIntent.timeframe = {
        ...queryIntent.timeframe,
        year: parseInt(yearMatch[1])
      };
    }

    // Detect specific dates and periods
    if (messageLower.includes('오늘')) {
      queryIntent.timeframe = { today: true };
    } else if (messageLower.includes('내일')) {
      queryIntent.timeframe = { tomorrow: true };
    } else if (messageLower.includes('어제')) {
      queryIntent.timeframe = { yesterday: true };
    } else if (messageLower.includes('이번 주') || messageLower.includes('이번주')) {
      queryIntent.timeframe = { thisWeek: true };
    } else if (messageLower.includes('다음 주') || messageLower.includes('다음주')) {
      queryIntent.timeframe = { nextWeek: true };
    } else if (messageLower.includes('지난 주') || messageLower.includes('지난주') || messageLower.includes('저번 주') || messageLower.includes('저번주')) {
      queryIntent.timeframe = { lastWeek: true };
    } else if (messageLower.includes('이번 달') || messageLower.includes('이번달')) {
      queryIntent.timeframe = { thisMonth: true };
    } else if (messageLower.includes('다음 달') || messageLower.includes('다음달')) {
      queryIntent.timeframe = { nextMonth: true };
    } else if (messageLower.includes('지난 달') || messageLower.includes('지난달') || messageLower.includes('저번 달') || messageLower.includes('저번달')) {
      queryIntent.timeframe = { lastMonth: true };
    } else if (messageLower.includes('올해') || messageLower.includes('이번 년') || messageLower.includes('이번년')) {
      queryIntent.timeframe = { thisYear: true };
    } else if (messageLower.includes('내년') || messageLower.includes('다음 년')) {
      queryIntent.timeframe = { nextYear: true };
    } else if (messageLower.includes('작년') || messageLower.includes('지난 년') || messageLower.includes('지난해')) {
      queryIntent.timeframe = { lastYear: true };
    }
  }

  return queryIntent;
}

module.exports = new ChatController();