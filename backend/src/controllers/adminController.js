const User = require('../models/User');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

class AdminController {
  async getDashboardStats(req, res) {
    try {
      // 대시보드 메인 통계 프로시저 호출
      const mainStats = await sequelize.query('CALL sp_get_dashboard_stats()', {
        type: QueryTypes.RAW
      });

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

      // MySQL 프로시저 결과 파싱
      const stats = {
        totalUsers: mainStats[0][0].total_users,
        activeUsers: mainStats[1][0].active_users_24h,
        newUsers: mainStats[2][0].new_users_30d,
        storageStats: mainStats[3][0],
        usageStats: usageStats[0],
        activityByType: activityByType[0],
        hourlyPattern: hourlyPattern[0],
        topActiveUsers: topActiveUsers[0],
        dataGrowth: dataGrowth[0],
        topStorageUsers: topStorageUsers[0],
        featureUsage: featureUsage[0]
      };

      res.json(stats);
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;

      // 사용자 목록 프로시저 호출
      const result = await sequelize.query('CALL sp_get_users_list(?, ?, ?)', {
        replacements: [search, parseInt(page), parseInt(limit)],
        type: QueryTypes.RAW
      });

      const totalCount = result[0][0].total_count;
      const users = result[1];

      res.json({
        users,
        total: totalCount,
        page: parseInt(page),
        totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserDetails(req, res) {
    try {
      const { id } = req.params;
      
      // 사용자 상세 정보 프로시저 호출
      const result = await sequelize.query('CALL sp_get_user_details(?)', {
        replacements: [id],
        type: QueryTypes.RAW
      });

      if (!result[0] || result[0].length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userDetails = {
        user: result[0][0],
        dataStats: result[1][0],
        recentActivity: result[2]
      };

      res.json(userDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 나머지 메서드들은 동일하게 유지
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { is_admin } = req.body;

      if (id == req.user.id) {
        return res.status(400).json({ error: 'Cannot change your own admin status' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ is_admin });
      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (id == req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
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
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
        status: 'healthy',
        database: 'connected',
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
        },
        uptime: Math.round(uptime / 60) + ' minutes',
        uploadsDiskUsage: Math.round(totalUploadSize / 1024 / 1024) + ' MB'
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'unhealthy',
        error: error.message 
      });
    }
  }
}

module.exports = new AdminController();