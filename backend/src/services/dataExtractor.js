const Contact = require('../models/Contact');
const Credential = require('../models/Credential');
const Goal = require('../models/Goal');
const Schedule = require('../models/Schedule');
const NumericalInfo = require('../models/NumericalInfo');
const sequelize = require('../config/database');
const { Op } = require('sequelize'); // Op import 추가

class DataExtractor {
  async saveExtractedData(userId, extractedData) {
    const transaction = await sequelize.transaction();
    
    try {
      const results = {
        contacts: [],
        credentials: [],
        goals: [],
        schedules: [],
        numerical_info: []
      };

      // Save contacts
      if (extractedData.contacts && extractedData.contacts.length > 0) {
        for (const contact of extractedData.contacts) {
          // Check for duplicate contacts
          const existingContact = await Contact.findOne({
            where: {
              user_id: userId,
              [Op.or]: [ // sequelize.Op.or -> Op.or로 변경
                { email: contact.email || null },
                { phone: contact.phone || null }
              ]
            },
            transaction
          });

          if (!existingContact) {
            const saved = await Contact.create({
              user_id: userId,
              ...contact
            }, { transaction });
            results.contacts.push(saved);
          } else {
            // Update existing contact with new information
            await existingContact.update({
              name: contact.name || existingContact.name,
              phone: contact.phone || existingContact.phone,
              email: contact.email || existingContact.email,
              address: contact.address || existingContact.address,
              notes: contact.notes || existingContact.notes
            }, { transaction });
            results.contacts.push(existingContact);
          }
        }
      }

      // Save credentials
      if (extractedData.credentials && extractedData.credentials.length > 0) {
        for (const credential of extractedData.credentials) {
          // Check for duplicate credentials
          const existingCredential = await Credential.findOne({
            where: {
              user_id: userId,
              website: credential.website,
              username: credential.username
            },
            transaction
          });

          if (!existingCredential) {
            const saved = await Credential.create({
              user_id: userId,
              ...credential
            }, { transaction });
            results.credentials.push(saved);
          } else {
            // Update password if changed
            if (credential.password) {
              await existingCredential.update({
                password: credential.password,
                notes: credential.notes || existingCredential.notes
              }, { transaction });
            }
            results.credentials.push(existingCredential);
          }
        }
      }

      // Save goals
      if (extractedData.goals && extractedData.goals.length > 0) {
        for (const goal of extractedData.goals) {
          const saved = await Goal.create({
            user_id: userId,
            ...goal,
            target_date: goal.target_date ? new Date(goal.target_date) : null
          }, { transaction });
          results.goals.push(saved);
        }
      }

      // Save schedules
      if (extractedData.schedules && extractedData.schedules.length > 0) {
        for (const schedule of extractedData.schedules) {
          let startTime = null;
          let endTime = null;

          // Helper function to parse Korean date format
          const parseKoreanDate = (dateStr) => {
            if (!dateStr) return null;
            
            // Handle "7월 26일" format
            const koreanDateMatch = dateStr.match(/(\d{1,2})월\s*(\d{1,2})일/);
            if (koreanDateMatch) {
              const currentYear = new Date().getFullYear();
              const month = parseInt(koreanDateMatch[1]) - 1; // JavaScript months are 0-indexed
              const day = parseInt(koreanDateMatch[2]);
              return new Date(currentYear, month, day, 0, 0, 0);
            }
            
            // Try standard date parsing
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
          };

          // Parse start_time if exists and is valid
          if (schedule.start_time && schedule.start_time !== 'null' && schedule.start_time !== '') {
            startTime = parseKoreanDate(schedule.start_time);
            
            if (!startTime) {
              console.warn(`Invalid start_time for schedule:`, schedule.title, schedule.start_time);
            }
          }

          // Parse end_time if exists and is valid
          if (schedule.end_time && schedule.end_time !== 'null' && schedule.end_time !== '') {
            endTime = parseKoreanDate(schedule.end_time);
            
            if (!endTime) {
              console.warn(`Invalid end_time for schedule:`, schedule.title, schedule.end_time);
            }
          }

          // If we have a start_time but no end_time, set end_time to end of same day
          if (startTime && !endTime) {
            endTime = new Date(startTime);
            endTime.setHours(23, 59, 59, 999);
          }

          // Check for schedule conflicts only if we have start_time
          if (startTime) {
            const whereClause = {
              user_id: userId,
              start_time: { [Op.not]: null }
            };

            if (endTime) {
              whereClause[Op.or] = [
                {
                  start_time: {
                    [Op.between]: [startTime, endTime]
                  }
                },
                {
                  end_time: {
                    [Op.between]: [startTime, endTime]
                  }
                }
              ];
            } else {
              whereClause.start_time = startTime;
            }

            const conflictingSchedule = await Schedule.findOne({
              where: whereClause,
              transaction
            });

            if (conflictingSchedule) {
              console.warn(`Schedule conflict detected for user ${userId}:`, schedule.title);
            }
          }

          // Create schedule data with explicit fields
          const scheduleData = {
            user_id: userId,
            title: schedule.title || null,
            description: schedule.description || null,
            start_time: startTime,
            end_time: endTime,
            location: schedule.location || null,
            created_at: new Date(),
            updated_at: null
          };

          const saved = await Schedule.create(scheduleData, { transaction });
          results.schedules.push(saved);
        }
      }

      // Save numerical info
      if (extractedData.numerical_info && extractedData.numerical_info.length > 0) {
        for (const info of extractedData.numerical_info) {
          // Categorize if not provided
          const category = info.category || this.categorizeNumericalInfo(info.label);
          
          const saved = await NumericalInfo.create({
            user_id: userId,
            ...info,
            category
          }, { transaction });
          results.numerical_info.push(saved);
        }
      }

      await transaction.commit();
      return results;
    } catch (error) {
      await transaction.rollback();
      console.error('Error saving extracted data:', error);
      throw error;
    }
  }

  categorizeNumericalInfo(label) {
    const lowerLabel = label.toLowerCase();
    
    if (lowerLabel.includes('bank') || lowerLabel.includes('account') || 
        lowerLabel.includes('balance') || lowerLabel.includes('금액') || 
        lowerLabel.includes('계좌')) {
      return 'banking';
    } else if (lowerLabel.includes('weight') || lowerLabel.includes('height') || 
               lowerLabel.includes('blood') || lowerLabel.includes('체중') || 
               lowerLabel.includes('신장') || lowerLabel.includes('혈압')) {
      return 'health';
    } else if (lowerLabel.includes('budget') || lowerLabel.includes('expense') || 
               lowerLabel.includes('income') || lowerLabel.includes('예산') || 
               lowerLabel.includes('지출') || lowerLabel.includes('수입')) {
      return 'finance';
    } else if (lowerLabel.includes('score') || lowerLabel.includes('grade') || 
               lowerLabel.includes('점수') || lowerLabel.includes('성적')) {
      return 'education';
    } else {
      return 'general';
    }
  }

  async getUserDataSummary(userId) {
    try {
      const [
        contactsCount,
        credentialsCount,
        goalsCount,
        schedulesCount,
        numericalInfoCount
      ] = await Promise.all([
        Contact.count({ where: { user_id: userId } }),
        Credential.count({ where: { user_id: userId } }),
        Goal.count({ where: { user_id: userId } }),
        Schedule.count({ where: { user_id: userId } }),
        NumericalInfo.count({ where: { user_id: userId } })
      ]);

      return {
        contacts: contactsCount,
        credentials: credentialsCount,
        goals: goalsCount,
        schedules: schedulesCount,
        numerical_info: numericalInfoCount,
        total: contactsCount + credentialsCount + goalsCount + schedulesCount + numericalInfoCount
      };
    } catch (error) {
      console.error('Error getting user data summary:', error);
      throw error;
    }
  }
}

module.exports = new DataExtractor();