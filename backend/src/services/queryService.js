const { Op } = require('sequelize');
const Contact = require('../models/Contact');
const Credential = require('../models/Credential');
const Goal = require('../models/Goal');
const Schedule = require('../models/Schedule');
const NumericalInfo = require('../models/NumericalInfo');

class QueryService {
  async executeQuery(userId, queryIntent) {
    try {
      let data = [];
      let message = '';

      switch (queryIntent.type) {
        case 'schedules':
          data = await this.querySchedules(userId, queryIntent.timeframe);
          message = this.formatScheduleMessage(data, queryIntent.timeframe);
          break;
        
        case 'contacts':
          data = await this.queryContacts(userId);
          message = this.formatContactMessage(data);
          break;
        
        case 'goals':
          data = await this.queryGoals(userId);
          message = this.formatGoalMessage(data);
          break;
        
        default:
          // If no specific type, get summary
          const summary = await this.getOverallSummary(userId, queryIntent.timeframe);
          data = summary.data;
          message = summary.message;
      }

      return { data, message };
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  async querySchedules(userId, timeframe) {
    const where = { user_id: userId };

    if (timeframe) {
      const today = new Date();
      
      if (timeframe.month && timeframe.year) {
        // Specific year and month
        const startDate = new Date(timeframe.year, timeframe.month - 1, 1);
        const endDate = new Date(timeframe.year, timeframe.month, 0, 23, 59, 59);
        
        where[Op.or] = [
          {
            start_time: {
              [Op.between]: [startDate, endDate]
            }
          },
          {
            start_time: null,
            title: {
              [Op.like]: `%${timeframe.month}월%`
            }
          }
        ];
      } else if (timeframe.month) {
        // Query by month (current year)
        const currentYear = today.getFullYear();
        const startDate = new Date(currentYear, timeframe.month - 1, 1);
        const endDate = new Date(currentYear, timeframe.month, 0, 23, 59, 59);
        
        where[Op.or] = [
          {
            start_time: {
              [Op.between]: [startDate, endDate]
            }
          },
          {
            start_time: null,
            title: {
              [Op.like]: `%${timeframe.month}월%`
            }
          }
        ];
      } else if (timeframe.today) {
        // Today's schedules
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        where.start_time = {
          [Op.between]: [startOfDay, endOfDay]
        };
      } else if (timeframe.yesterday) {
        // Yesterday's schedules
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        
        where.start_time = {
          [Op.between]: [yesterday, yesterdayEnd]
        };
      } else if (timeframe.tomorrow) {
        // Tomorrow's schedules
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);
        
        where.start_time = {
          [Op.between]: [tomorrow, tomorrowEnd]
        };
      } else if (timeframe.thisWeek) {
        // This week's schedules (Monday to Sunday)
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        const monday = new Date(today);
        monday.setDate(today.getDate() - daysToMonday);
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        where.start_time = {
          [Op.between]: [monday, sunday]
        };
      } else if (timeframe.lastWeek) {
        // Last week's schedules
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() - daysToMonday);
        
        const lastMonday = new Date(thisMonday);
        lastMonday.setDate(thisMonday.getDate() - 7);
        lastMonday.setHours(0, 0, 0, 0);
        
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        lastSunday.setHours(23, 59, 59, 999);
        
        where.start_time = {
          [Op.between]: [lastMonday, lastSunday]
        };
      } else if (timeframe.nextWeek) {
        // Next week's schedules
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() - daysToMonday);
        
        const nextMonday = new Date(thisMonday);
        nextMonday.setDate(thisMonday.getDate() + 7);
        nextMonday.setHours(0, 0, 0, 0);
        
        const nextSunday = new Date(nextMonday);
        nextSunday.setDate(nextMonday.getDate() + 6);
        nextSunday.setHours(23, 59, 59, 999);
        
        where.start_time = {
          [Op.between]: [nextMonday, nextSunday]
        };
      } else if (timeframe.thisMonth) {
        // This month's schedules
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        
        where.start_time = {
          [Op.between]: [startOfMonth, endOfMonth]
        };
      } else if (timeframe.lastMonth) {
        // Last month's schedules
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
        
        where.start_time = {
          [Op.between]: [startOfLastMonth, endOfLastMonth]
        };
      } else if (timeframe.nextMonth) {
        // Next month's schedules
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59);
        
        where.start_time = {
          [Op.between]: [startOfNextMonth, endOfNextMonth]
        };
      } else if (timeframe.thisYear) {
        // This year's schedules
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        
        where.start_time = {
          [Op.between]: [startOfYear, endOfYear]
        };
      } else if (timeframe.lastYear) {
        // Last year's schedules
        const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59);
        
        where.start_time = {
          [Op.between]: [startOfLastYear, endOfLastYear]
        };
      } else if (timeframe.nextYear) {
        // Next year's schedules
        const startOfNextYear = new Date(today.getFullYear() + 1, 0, 1);
        const endOfNextYear = new Date(today.getFullYear() + 1, 11, 31, 23, 59, 59);
        
        where.start_time = {
          [Op.between]: [startOfNextYear, endOfNextYear]
        };
      }
    }

    return await Schedule.findAll({
      where,
      order: [['start_time', 'ASC'], ['created_at', 'DESC']]
    });
  }

  async queryContacts(userId) {
    return await Contact.findAll({
      where: { user_id: userId },
      order: [['name', 'ASC']]
    });
  }

  async queryGoals(userId) {
    return await Goal.findAll({
      where: { user_id: userId },
      order: [['target_date', 'ASC'], ['created_at', 'DESC']]
    });
  }

  async getOverallSummary(userId, timeframe) {
    const schedules = await this.querySchedules(userId, timeframe);
    const contacts = await Contact.count({ where: { user_id: userId } });
    const goals = await Goal.count({ where: { user_id: userId, status: 'pending' } });
    
    const data = {
      schedules,
      contactsCount: contacts,
      goalsCount: goals
    };

    let message = '현재 저장된 정보:\n';
    if (schedules.length > 0) {
      message += `\n📅 일정 ${schedules.length}개\n`;
      schedules.slice(0, 5).forEach(schedule => {
        const dateStr = schedule.start_time ? 
          new Date(schedule.start_time).toLocaleDateString('ko-KR') : '날짜 미정';
        message += `- ${schedule.title} (${dateStr})\n`;
      });
      if (schedules.length > 5) {
        message += `...외 ${schedules.length - 5}개\n`;
      }
    }
    message += `\n👥 연락처: ${contacts}개`;
    message += `\n🎯 진행 중인 목표: ${goals}개`;

    return { data, message };
  }

  formatScheduleMessage(schedules, timeframe) {
    if (schedules.length === 0) {
      if (timeframe?.month) {
        return `${timeframe.month}월에는 등록된 일정이 없습니다.`;
      } else if (timeframe?.yesterday) {
        return '어제는 등록된 일정이 없습니다.';
      } else if (timeframe?.today) {
        return '오늘은 등록된 일정이 없습니다.';
      } else if (timeframe?.tomorrow) {
        return '내일은 등록된 일정이 없습니다.';
      } else if (timeframe?.thisWeek) {
        return '이번 주에는 등록된 일정이 없습니다.';
      } else if (timeframe?.lastWeek) {
        return '지난 주에는 등록된 일정이 없습니다.';
      } else if (timeframe?.nextWeek) {
        return '다음 주에는 등록된 일정이 없습니다.';
      } else if (timeframe?.thisMonth) {
        return '이번 달에는 등록된 일정이 없습니다.';
      } else if (timeframe?.lastMonth) {
        return '지난 달에는 등록된 일정이 없습니다.';
      } else if (timeframe?.nextMonth) {
        return '다음 달에는 등록된 일정이 없습니다.';
      } else if (timeframe?.thisYear) {
        return '올해는 등록된 일정이 없습니다.';
      } else if (timeframe?.lastYear) {
        return '작년에는 등록된 일정이 없습니다.';
      } else if (timeframe?.nextYear) {
        return '내년에는 등록된 일정이 없습니다.';
      }
      return '등록된 일정이 없습니다.';
    }

    let message = '';
    const today = new Date();
    
    if (timeframe?.month && timeframe?.year) {
      message = `${timeframe.year}년 ${timeframe.month}월 일정 (${schedules.length}개):\n\n`;
    } else if (timeframe?.month) {
      message = `${timeframe.month}월 일정 (${schedules.length}개):\n\n`;
    } else if (timeframe?.yesterday) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      message = `어제 (${yesterday.getMonth() + 1}월 ${yesterday.getDate()}일) 일정:\n\n`;
    } else if (timeframe?.today) {
      message = `오늘 (${today.getMonth() + 1}월 ${today.getDate()}일) 일정:\n\n`;
    } else if (timeframe?.tomorrow) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      message = `내일 (${tomorrow.getMonth() + 1}월 ${tomorrow.getDate()}일) 일정:\n\n`;
    } else if (timeframe?.thisWeek) {
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      message = `이번 주 일정 (${monday.getMonth() + 1}월 ${monday.getDate()}일 - ${sunday.getMonth() + 1}월 ${sunday.getDate()}일):\n\n`;
    } else if (timeframe?.lastWeek) {
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - daysToMonday);
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      
      message = `지난 주 일정 (${lastMonday.getMonth() + 1}월 ${lastMonday.getDate()}일 - ${lastSunday.getMonth() + 1}월 ${lastSunday.getDate()}일):\n\n`;
    } else if (timeframe?.nextWeek) {
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - daysToMonday);
      const nextMonday = new Date(thisMonday);
      nextMonday.setDate(thisMonday.getDate() + 7);
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      
      message = `다음 주 일정 (${nextMonday.getMonth() + 1}월 ${nextMonday.getDate()}일 - ${nextSunday.getMonth() + 1}월 ${nextSunday.getDate()}일):\n\n`;
    } else if (timeframe?.thisMonth) {
      message = `이번 달 (${today.getMonth() + 1}월) 일정 (${schedules.length}개):\n\n`;
    } else if (timeframe?.lastMonth) {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
      message = `지난 달 (${lastMonth.getMonth() + 1}월) 일정 (${schedules.length}개):\n\n`;
    } else if (timeframe?.nextMonth) {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1);
      message = `다음 달 (${nextMonth.getMonth() + 1}월) 일정 (${schedules.length}개):\n\n`;
    } else if (timeframe?.thisYear) {
      message = `${today.getFullYear()}년 일정 (${schedules.length}개):\n\n`;
    } else if (timeframe?.lastYear) {
      message = `${today.getFullYear() - 1}년 일정 (${schedules.length}개):\n\n`;
    } else if (timeframe?.nextYear) {
      message = `${today.getFullYear() + 1}년 일정 (${schedules.length}개):\n\n`;
    } else {
      message = `일정 목록 (${schedules.length}개):\n\n`;
    }

    schedules.forEach((schedule, index) => {
      const startDate = schedule.start_time ? 
        new Date(schedule.start_time).toLocaleString('ko-KR', {
          month: 'long',
          day: 'numeric',
          hour: schedule.start_time.includes('00:00:00') ? undefined : '2-digit',
          minute: schedule.start_time.includes('00:00:00') ? undefined : '2-digit'
        }) : '날짜 미정';
      
      message += `${index + 1}. ${schedule.title}\n`;
      message += `   📅 ${startDate}`;
      if (schedule.location) {
        message += ` | 📍 ${schedule.location}`;
      }
      if (schedule.description) {
        message += `\n   📝 ${schedule.description}`;
      }
      message += '\n\n';
    });

    return message.trim();
  }

  formatContactMessage(contacts) {
    if (contacts.length === 0) {
      return '저장된 연락처가 없습니다.';
    }

    let message = `연락처 목록 (${contacts.length}개):\n\n`;
    contacts.forEach((contact, index) => {
      message += `${index + 1}. ${contact.name}\n`;
      if (contact.phone) message += `   📞 ${contact.phone}\n`;
      if (contact.email) message += `   ✉️ ${contact.email}\n`;
      message += '\n';
    });

    return message.trim();
  }

  formatGoalMessage(goals) {
    if (goals.length === 0) {
      return '등록된 목표가 없습니다.';
    }

    let message = `목표 목록 (${goals.length}개):\n\n`;
    goals.forEach((goal, index) => {
      const statusEmoji = {
        pending: '⏳',
        in_progress: '🔄',
        completed: '✅'
      };
      
      message += `${index + 1}. ${statusEmoji[goal.status]} ${goal.title}\n`;
      if (goal.target_date) {
        const targetDate = new Date(goal.target_date).toLocaleDateString('ko-KR');
        message += `   🎯 목표일: ${targetDate}\n`;
      }
      if (goal.description) {
        message += `   📝 ${goal.description}\n`;
      }
      message += '\n';
    });

    return message.trim();
  }
}

module.exports = new QueryService();