const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  async getChatResponse(message, userId) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful personal assistant. Extract and identify personal information from user messages including contacts, credentials, goals, schedules, and numerical data.
            
            When extracting information, be precise and structured:
            - For contacts: Extract name, phone, email, and address separately
            - For credentials: Extract website/service name, username, and password
            - For goals: Extract title, description, and target date
            - For schedules: Extract title, description, start time, end time, and location
            - For numerical info: Categorize appropriately (banking, health, etc.) and include label, value, and unit
            
            Always respond in the same language as the user's message.`
          },
          {
            role: "user",
            content: message
          }
        ],
        functions: [
          {
            name: "extract_personal_info",
            description: "Extract personal information from the message",
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

      const response = completion.choices[0].message;
      
      // Parse function call if exists
      let extractedData = null;
      if (response.function_call && response.function_call.name === 'extract_personal_info') {
        try {
          extractedData = JSON.parse(response.function_call.arguments);
          
          // Validate and clean extracted data
          extractedData = this.validateExtractedData(extractedData);
        } catch (parseError) {
          console.error('Error parsing function call:', parseError);
        }
      }

      return {
        message: response.content || this.generateResponseMessage(extractedData),
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