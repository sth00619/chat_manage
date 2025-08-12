const OpenAI = require('openai');
const Subscription = require('../models/Subscription');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  async checkSubscriptionLimit(userId) {
    const subscription = await Subscription.findOne({
      where: { user_id: userId, status: 'active' }
    });

    if (!subscription) {
      const defaultLimit = 10;
      return { canUse: true, remaining: defaultLimit };
    }

    if (subscription.ai_requests_limit === -1) {
      return { canUse: true, remaining: 'unlimited' };
    }

    const remaining = subscription.ai_requests_limit - subscription.ai_requests_used;
    if (remaining <= 0) {
      return { canUse: false, remaining: 0 };
    }

    return { canUse: true, remaining, subscription };
  }

  async incrementUsage(userId) {
    const subscription = await Subscription.findOne({
      where: { user_id: userId, status: 'active' }
    });

    if (subscription && subscription.ai_requests_limit !== -1) {
      subscription.ai_requests_used += 1;
      await subscription.save();
    }
  }

  async getChatResponse(message, userId) {
    try {
      const { canUse, remaining } = await this.checkSubscriptionLimit(userId);
      
      if (!canUse) {
        throw new Error('AI 요청 한도를 초과했습니다. 플랜을 업그레이드해주세요.');
      }
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      
      // 디버깅을 위한 로그
      console.log('Received message:', message);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant. You must ALWAYS provide a response in Korean or English based on the user's language.

For general questions (programming, science, history, etc.), provide detailed, helpful answers.
For personal data (contacts, schedules, goals), extract the information AND provide a confirmation message.

Examples:
- "파이썬 라이브러리 알려줘" → Answer: "파이썬에서 자주 사용되는 라이브러리는..."
- "내일 회의 있어" → Extract schedule AND respond: "내일 회의 일정을 저장했습니다."

Current date: ${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}

When extracting dates:
- Convert "7월 26일" to "${currentYear}-07-26 00:00:00"
- Convert relative dates like "내일" based on current date`
          },
          {
            role: "user",
            content: message
          }
        ],
        functions: [
          {
            name: "extract_personal_info",
            description: "Extract personal information ONLY when user provides data to save",
            parameters: {
              type: "object",
              properties: {
                contacts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string" },
                      address: { type: "string" },
                      notes: { type: "string" }
                    }
                  }
                },
                credentials: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      website: { type: "string" },
                      username: { type: "string" },
                      password: { type: "string" },
                      notes: { type: "string" }
                    }
                  }
                },
                goals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      target_date: { type: "string", format: "date" },
                      status: { type: "string", enum: ["pending", "in_progress", "completed"] }
                    }
                  }
                },
                schedules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      start_time: { type: "string", format: "date-time" },
                      end_time: { type: "string", format: "date-time" },
                      location: { type: "string" }
                    }
                  }
                },
                numerical_info: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      label: { type: "string" },
                      value: { type: "string" },
                      unit: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        ],
        function_call: "auto",
        temperature: 0.7,
        max_tokens: 1000
      });

      // 디버깅을 위한 로그
      console.log('OpenAI response:', JSON.stringify(completion.choices[0].message, null, 2));

      const response = completion.choices[0].message;
      
      // Parse function call if exists
      let extractedData = null;
      if (response.function_call && response.function_call.name === 'extract_personal_info') {
        try {
          extractedData = JSON.parse(response.function_call.arguments);
          
          // Post-process dates to ensure correct format
          extractedData = this.postProcessDates(extractedData);
          
          // Validate and clean extracted data
          extractedData = this.validateExtractedData(extractedData);
          
          console.log('Extracted data:', extractedData);
        } catch (parseError) {
          console.error('Error parsing function call:', parseError);
        }
      }

      // 응답 메시지 처리
      let responseMessage = response.content || '';
      
      // content가 비어있고 function_call만 있는 경우
      if (!responseMessage && extractedData) {
        responseMessage = this.generateResponseMessage(extractedData);
      }
      
      // 그래도 메시지가 없으면
      if (!responseMessage) {
        // 일반 질문인 경우 다시 시도
        if (!extractedData) {
          console.log('No response content, retrying without functions...');
          
          const simpleCompletion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are a helpful AI assistant. Answer the user's question in their language."
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          });
          
          responseMessage = simpleCompletion.choices[0].message.content || 
            "죄송합니다. 응답을 생성할 수 없습니다.";
        } else {
          responseMessage = "정보를 처리했습니다.";
        }
      }

      await this.incrementUsage(userId);

      return {
        message: responseMessage,
        extractedData
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Handle specific errors
      if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API key.');
      }
      
      throw error;
    }
  }

  postProcessDates(data) {
    if (!data) return data;
    
    // Process schedules
    if (data.schedules && Array.isArray(data.schedules)) {
      data.schedules = data.schedules.map(schedule => {
        // Ensure datetime format
        if (schedule.start_time) {
          // If it's just a date without time, add 00:00:00
          if (schedule.start_time.match(/^\d{4}-\d{2}-\d{2}$/)) {
            schedule.start_time = `${schedule.start_time} 00:00:00`;
          }
        }
        
        if (schedule.end_time) {
          // If it's just a date without time, add 23:59:59
          if (schedule.end_time.match(/^\d{4}-\d{2}-\d{2}$/)) {
            schedule.end_time = `${schedule.end_time} 23:59:59`;
          }
        }
        
        return schedule;
      });
    }
    
    return data;
  }

  validateExtractedData(data) {
    const validated = {};
    
    // Validate contacts
    if (data.contacts && Array.isArray(data.contacts)) {
      validated.contacts = data.contacts.filter(contact => 
        contact.name || contact.phone || contact.email
      );
    }
    
    // Validate credentials
    if (data.credentials && Array.isArray(data.credentials)) {
      validated.credentials = data.credentials.filter(cred => 
        cred.website && cred.username
      );
    }
    
    // Validate goals
    if (data.goals && Array.isArray(data.goals)) {
      validated.goals = data.goals.filter(goal => 
        goal.title
      ).map(goal => ({
        ...goal,
        status: goal.status || 'pending'
      }));
    }
    
    // Validate schedules
    if (data.schedules && Array.isArray(data.schedules)) {
      validated.schedules = data.schedules.filter(schedule => 
        schedule.title && schedule.start_time
      );
    }
    
    // Validate numerical info
    if (data.numerical_info && Array.isArray(data.numerical_info)) {
      validated.numerical_info = data.numerical_info.filter(info => 
        info.label && info.value
      );
    }
    
    return validated;
  }

  generateResponseMessage(extractedData) {
    if (!extractedData) {
      return "메시지를 이해했습니다. 어떻게 도와드릴까요?";
    }
    
    const items = [];
    
    if (extractedData.contacts?.length > 0) {
      items.push(`${extractedData.contacts.length}개의 연락처`);
    }
    if (extractedData.credentials?.length > 0) {
      items.push(`${extractedData.credentials.length}개의 계정 정보`);
    }
    if (extractedData.goals?.length > 0) {
      items.push(`${extractedData.goals.length}개의 목표`);
    }
    if (extractedData.schedules?.length > 0) {
      items.push(`${extractedData.schedules.length}개의 일정`);
    }
    if (extractedData.numerical_info?.length > 0) {
      items.push(`${extractedData.numerical_info.length}개의 수치 정보`);
    }
    
    if (items.length > 0) {
      return `다음 정보를 저장했습니다: ${items.join(', ')}`;
    }
    
    return "정보를 처리했습니다.";
  }
}

module.exports = new OpenAIService();