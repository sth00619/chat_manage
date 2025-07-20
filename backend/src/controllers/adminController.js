// AdminController 파일 상단에 추가
const User = require('../models/User');
const Album = require('../models/Album');
const Contact = require('../models/Contact');
const Credential = require('../models/Credential');
const Goal = require('../models/Goal');
const Schedule = require('../models/Schedule');
const NumericalInfo = require('../models/NumericalInfo');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

class AdminController {
  async getDashboardStats(req, res) {
    try {
      // 대시보드 메인 통계 프로시저 호출
      const mainStats = await sequelize.query('CALL sp_get_dashboard_stats()', {
        type: QueryTypes.RAW
      });

      console.log('Raw mainStats:', JSON.stringify(mainStats, null, 2));

      // 사용량 추이 (30일)
      const usageStats = await sequelize.query('CALL sp_get_usage_trend(?)', {
        replacements: [30],
        type: QueryTypes.RAW
      });

      // 활동 유형별 통계 (7일)
      const activityByType = await sequelize.query('CALL sp_get_activity_by_type(?)', {
        replacements: [7],
        type: QueryTypes.RAW
      });

      // 시간대별 사용 패턴
      const hourlyPattern = await sequelize.query('CALL sp_get_hourly_usage_pattern()', {
        type: QueryTypes.RAW
      });

      // 가장 활발한 사용자
      const topActiveUsers = await sequelize.query('CALL sp_get_top_active_users()', {
        type: QueryTypes.RAW
      });

      // 데이터 증가 추이
      const dataGrowth = await sequelize.query('CALL sp_get_data_growth_trend()', {
        type: QueryTypes.RAW
      });

      // 저장 용량 상위 사용자
      const topStorageUsers = await sequelize.query('CALL sp_get_top_storage_users()', {
        type: QueryTypes.RAW
      });

      // 기능별 사용 통계
      const featureUsage = await sequelize.query('CALL sp_get_feature_usage_stats()', {
        type: QueryTypes.RAW
      });

      // 프로시저 결과가 배열의 첫 번째 요소에 있는 구조로 수정
      const mainStatsData = mainStats[0] || {};
      
      const stats = {
        // mainStats가 단일 객체 배열 형태로 오는 경우
        totalUsers: mainStatsData.total_users || 0,
        activeUsers: mainStatsData.active_users_today || 0,
        newUsers: mainStatsData.new_users_30d || 0,
        storageStats: {
          total_files: mainStatsData.total_files || 0,
          total_size: mainStatsData.total_size || 0,
          avg_file_size: mainStatsData.avg_file_size || 0
        },
        usageStats: usageStats[0] || [],
        activityByType: activityByType[0] || [],
        hourlyPattern: hourlyPattern[0] || [],
        topActiveUsers: topActiveUsers[0] || [],
        dataGrowth: dataGrowth[0] || [],
        topStorageUsers: topStorageUsers[0] || [],
        featureUsage: featureUsage[0] || []
      };

      console.log('Final stats:', JSON.stringify(stats, null, 2));

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch dashboard stats',
        details: error.message
      });
    }
  }

  async getUsers(req, res) {
    try {
      console.log('=== Admin Users API Called ===');
      console.log('📨 Raw query params:', req.query);
      console.log('📍 Full URL:', req.originalUrl);
      
      // 모든 가능한 파라미터 이름 확인
      const { 
        page = 1, 
        limit = 20, 
        currentSearchTerm = req.query.search || req.query.searchTerm || req.query.q || '',
        search = req.query.currentSearchTerm || ''
      } = req.query;
      
      // 실제 검색어 결정
      const actualSearchTerm = currentSearchTerm || search || '';
      
      console.log('🔍 All query params:', req.query);
      console.log('🔎 Search term resolution:', {
        currentSearchTerm,
        search,
        actualSearchTerm,
        finalLength: actualSearchTerm.length
      });
      
      // 프로시저 호출 준비
      const query = 'CALL sp_get_users_list(?, ?, ?)';
      const params = [
        actualSearchTerm,            // 검색어 (문자열)
        parseInt(page, 10),          // 페이지 번호 (정수)
        parseInt(limit, 10)          // 페이지 크기 (정수)
      ];
      
      console.log('🚀 Calling procedure with:');
      console.log('   - Search term:', `"${params[0]}"`);
      console.log('   - Page:', params[1]);
      console.log('   - Limit:', params[2]);
      console.log('   - SQL Query:', query);
      
      // 프로시저 실행 (Sequelize 사용)
      const results = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.RAW
      });
      
      console.log('✅ Raw DB response received');
      console.log('📊 Full results:', JSON.stringify(results, null, 2));
      
      // 결과 데이터 추출 - Sequelize RAW 쿼리 결과 구조 확인
      let userData = [];
      let total = 0;
      
      // results가 배열이고 첫 번째 요소가 있는 경우
      if (Array.isArray(results) && results.length > 0) {
        // results[0]이 배열인 경우 (일반적인 경우)
        if (Array.isArray(results[0])) {
          userData = results[0];
        } 
        // results 자체가 데이터 배열인 경우
        else if (results[0].id !== undefined) {
          userData = results;
        }
      }
      
      console.log('📦 User data extracted:', {
        isArray: Array.isArray(userData),
        count: userData.length,
        firstUser: userData[0] ? {
          id: userData[0].id,
          email: userData[0].email,
          name: userData[0].name
        } : 'No users'
      });
      
      // total_count 추출
      if (userData.length > 0 && userData[0].total_count !== undefined) {
        total = userData[0].total_count;
      } else {
        total = userData.length;
      }
      
      console.log('📈 Total users matching criteria:', total);
      console.log('🔍 Current search term effect:', {
        searchTerm: actualSearchTerm,
        totalInDB: total,
        returnedCount: userData.length,
        isFiltered: actualSearchTerm ? 'YES' : 'NO'
      });
      
      // userData가 배열인지 확인
      if (!Array.isArray(userData)) {
        console.error('❌ userData is not an array:', typeof userData, userData);
        userData = [];
      }
      
      // 응답 데이터 구성
      const response = {
        success: true,
        data: {
          users: userData.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            provider: user.provider,
            is_admin: user.is_admin,
            created_at: user.created_at,
            total_activities: user.total_activities || 0,
            last_activity: user.last_activity
          })),
          total: total,
          totalPages: Math.ceil(total / parseInt(limit, 10)),
          currentPage: parseInt(page, 10),
          limit: parseInt(limit, 10)
        }
      };
      
      console.log('📤 Sending response:', {
        userCount: response.data.users.length,
        total: response.data.total,
        pages: response.data.totalPages
      });
      console.log('=== End of Admin Users API ===\n');
      
      res.json(response);
      
    } catch (error) {
      console.error('❌ Error in getUsers:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch users',
        message: error.message 
      });
    }
  }

  async getUserDetail(req, res) {
    try {
      const { id } = req.params;
      
      console.log('=== getUserDetail called ===');
      console.log('User ID:', id);

      // 사용자 기본 정보 조회
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      console.log('Found user:', user.toJSON());

      // 사용자 데이터 통계 조회
      const [contactsCount, credentialsCount, goalsCount, schedulesCount, numericalInfoCount, albumsCount] = await Promise.all([
        Contact.count({ where: { user_id: id } }),
        Credential.count({ where: { user_id: id } }),
        Goal.count({ where: { user_id: id } }),
        Schedule.count({ where: { user_id: id } }),
        NumericalInfo.count({ where: { user_id: id } }),
        Album.count({ where: { user_id: id } })
      ]);

      // 총 저장 용량 계산
      const [storageResult] = await sequelize.query(`
        SELECT COALESCE(SUM(size), 0) as total_storage
        FROM albums 
        WHERE user_id = ?
      `, {
        replacements: [id],
        type: QueryTypes.SELECT
      });

      const totalStorage = storageResult?.total_storage || 0;

      // 최근 활동 조회
      const recentActivity = await sequelize.query(`
        SELECT 
          'contact' as activity_type,
          created_at,
          'contacts' as table_name
        FROM contacts 
        WHERE user_id = ?
        
        UNION ALL
        
        SELECT 
          'credential' as activity_type,
          created_at,
          'credentials' as table_name
        FROM credentials 
        WHERE user_id = ?
        
        UNION ALL
        
        SELECT 
          'goal' as activity_type,
          created_at,
          'goals' as table_name
        FROM goals 
        WHERE user_id = ?
        
        UNION ALL
        
        SELECT 
          'schedule' as activity_type,
          created_at,
          'schedules' as table_name
        FROM schedules 
        WHERE user_id = ?
        
        UNION ALL
        
        SELECT 
          'numerical_info' as activity_type,
          created_at,
          'numerical_info' as table_name
        FROM numerical_info 
        WHERE user_id = ?
        
        UNION ALL
        
        SELECT 
          'album' as activity_type,
          created_at,
          'albums' as table_name
        FROM albums 
        WHERE user_id = ?
        
        ORDER BY created_at DESC
        LIMIT 20
      `, {
        replacements: [id, id, id, id, id, id],
        type: QueryTypes.SELECT
      });

      const userDetails = {
        user: user.toJSON(),
        dataStats: {
          contacts: contactsCount,
          credentials: credentialsCount,
          goals: goalsCount,
          schedules: schedulesCount,
          numericalInfo: numericalInfoCount,
          albums: albumsCount,
          totalStorage: parseInt(totalStorage)
        },
        recentActivity: recentActivity || []
      };

      console.log('User details:', userDetails);

      res.json({
        success: true,
        data: userDetails
      });

    } catch (error) {
      console.error('Get user detail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user details',
        details: error.message
      });
    }
  }

  async getUsageTrend(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      
      const result = await sequelize.query('CALL sp_get_usage_trend(?)', {
        replacements: [days],
        type: QueryTypes.RAW
      });

      res.json({
        success: true,
        data: result[0] || []
      });
    } catch (error) {
      console.error('Admin usage trend error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch usage trend'
      });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { is_admin } = req.body;

      if (id == req.user.id) {
        return res.status(400).json({ 
          success: false,
          error: 'Cannot change your own admin status' 
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      await user.update({ is_admin });
      
      res.json({ 
        success: true,
        message: 'User role updated successfully' 
      });
    } catch (error) {
      console.error('Admin update user role error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update user role'
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (id == req.user.id) {
        return res.status(400).json({ 
          success: false,
          error: 'Cannot delete your own account' 
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // Delete user's albums (files)
      const albums = await Album.findAll({ where: { user_id: id } });
      const fs = require('fs');
      const path = require('path');
      
      for (const album of albums) {
        const filePath = path.join(__dirname, '../../uploads', album.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete user (cascade will handle related records)
      await user.destroy();
      
      res.json({ 
        success: true,
        message: 'User deleted successfully' 
      });
    } catch (error) {
      console.error('Admin delete user error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete user'
      });
    }
  }

  async getSystemHealth(req, res) {
    try {
      // Database connection check
      await sequelize.authenticate();
      
      // Memory usage
      const memoryUsage = process.memoryUsage();
      
      // Uptime
      const uptime = process.uptime();
      
      // Disk usage for uploads
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../../uploads');
      
      let totalUploadSize = 0;
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
          const stats = fs.statSync(path.join(uploadsDir, file));
          totalUploadSize += stats.size;
        }
      }

      res.json({
        success: true,
        data: {
          status: 'healthy',
          database: 'connected',
          memory: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
          },
          uptime: Math.round(uptime / 60) + ' minutes',
          uploadsDiskUsage: Math.round(totalUploadSize / 1024 / 1024) + ' MB'
        }
      });
    } catch (error) {
      console.error('Admin system health error:', error);
      res.status(500).json({ 
        success: false,
        status: 'unhealthy',
        error: error.message 
      });
    }
  }

  async getActivityByType(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      
      const result = await sequelize.query('CALL sp_get_activity_by_type(?)', {
        replacements: [days],
        type: QueryTypes.RAW
      });

      res.json({
        success: true,
        data: result[0] || []
      });
    } catch (error) {
      console.error('Admin activity by type error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch activity by type'
      });
    }
  }

  async getHourlyPattern(req, res) {
    try {
      const result = await sequelize.query('CALL sp_get_hourly_usage_pattern()', {
        type: QueryTypes.RAW
      });

      res.json({
        success: true,
        data: result[0] || []
      });
    } catch (error) {
      console.error('Admin hourly pattern error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch hourly pattern'
      });
    }
  }

  async getTopActiveUsers(req, res) {
    try {
      const result = await sequelize.query('CALL sp_get_top_active_users()', {
        type: QueryTypes.RAW
      });

      res.json({
        success: true,
        data: result[0] || []
      });
    } catch (error) {
      console.error('Admin top active users error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch top active users'
      });
    }
  }

  async getDataGrowthTrend(req, res) {
    try {
      const result = await sequelize.query('CALL sp_get_data_growth_trend()', {
        type: QueryTypes.RAW
      });

      res.json({
        success: true,
        data: result[0] || []
      });
    } catch (error) {
      console.error('Admin data growth trend error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch data growth trend'
      });
    }
  }

  async getTopStorageUsers(req, res) {
    try {
      const result = await sequelize.query('CALL sp_get_top_storage_users()', {
        type: QueryTypes.RAW
      });

      res.json({
        success: true,
        data: result[0] || []
      });
    } catch (error) {
      console.error('Admin top storage users error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch top storage users'
      });
    }
  }

  async getFeatureUsageStats(req, res) {
    try {
      const result = await sequelize.query('CALL sp_get_feature_usage_stats()', {
        type: QueryTypes.RAW
      });

      res.json({
        success: true,
        data: result[0] || []
      });
    } catch (error) {
      console.error('Admin feature usage stats error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch feature usage stats'
      });
    }
  }
}

module.exports = new AdminController();