const User = require('../models/User');
const Contact = require('../models/Contact');
const Credential = require('../models/Credential');
const Goal = require('../models/Goal');
const Schedule = require('../models/Schedule');
const NumericalInfo = require('../models/NumericalInfo');
const Album = require('../models/Album');
const UsageStat = require('../models/UsageStat');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

class AdminController {
  async getDashboardStats(req, res) {
    try {
      // Total users
      const totalUsers = await User.count();

      // Active users (logged in within last 24 hours)
      const activeUsers = await sequelize.query(
        `SELECT COUNT(DISTINCT user_id) as count 
         FROM usage_stats 
         WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
        { type: sequelize.QueryTypes.SELECT }
      );

      // New users (last 30 days)
      const newUsers = await User.count({
        where: {
          created_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      // Usage stats for the last 30 days
      const usageStats = await sequelize.query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_actions,
          COUNT(DISTINCT user_id) as unique_users
         FROM usage_stats 
         WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        { type: sequelize.QueryTypes.SELECT }
      );

      // Storage stats
      const storageStats = await Promise.all([
        Contact.count(),
        Credential.count(),
        Goal.count(),
        Schedule.count(),
        NumericalInfo.count(),
        Album.count(),
        Album.sum('size')
      ]);

      const [
        totalContacts,
        totalCredentials,
        totalGoals,
        totalSchedules,
        totalNumericalInfo,
        totalAlbums,
        totalStorageBytes
      ] = storageStats;

      // Activity by type (last 7 days)
      const activityByType = await sequelize.query(
        `SELECT 
          action_type,
          COUNT(*) as count
         FROM usage_stats 
         WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY action_type
         ORDER BY count DESC`,
        { type: sequelize.QueryTypes.SELECT }
      );

      res.json({
        totalUsers,
        activeUsers: activeUsers[0].count,
        newUsers,
        usageStats,
        storageStats: {
          total_contacts: totalContacts,
          total_credentials: totalCredentials,
          total_goals: totalGoals,
          total_schedules: totalSchedules,
          total_numerical_info: totalNumericalInfo,
          total_albums: totalAlbums,
          total_storage_bytes: totalStorageBytes || 0
        },
        activityByType
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const where = search ? {
        [Op.or]: [
          { email: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } }
        ]
      } : {};

      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: ['id', 'email', 'name', 'provider', 'is_admin', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Get usage stats for each user
      const userIds = users.map(u => u.id);
      const userStats = await sequelize.query(
        `SELECT 
          user_id,
          COUNT(*) as total_actions,
          MAX(created_at) as last_activity
         FROM usage_stats 
         WHERE user_id IN (:userIds)
         GROUP BY user_id`,
        { 
          replacements: { userIds },
          type: sequelize.QueryTypes.SELECT 
        }
      );

      const statsMap = userStats.reduce((acc, stat) => {
        acc[stat.user_id] = stat;
        return acc;
      }, {});

      const usersWithStats = users.map(user => ({
        ...user.toJSON(),
        stats: statsMap[user.id] || { total_actions: 0, last_activity: null }
      }));

      res.json({
        users: usersWithStats,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserDetails(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        attributes: ['id', 'email', 'name', 'provider', 'is_admin', 'created_at']
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's data counts
      const [
        contactsCount,
        credentialsCount,
        goalsCount,
        schedulesCount,
        numericalInfoCount,
        albumsCount,
        totalStorage
      ] = await Promise.all([
        Contact.count({ where: { user_id: id } }),
        Credential.count({ where: { user_id: id } }),
        Goal.count({ where: { user_id: id } }),
        Schedule.count({ where: { user_id: id } }),
        NumericalInfo.count({ where: { user_id: id } }),
        Album.count({ where: { user_id: id } }),
        Album.sum('size', { where: { user_id: id } })
      ]);

      // Get recent activity
      const recentActivity = await UsageStat.findAll({
        where: { user_id: id },
        order: [['created_at', 'DESC']],
        limit: 10
      });

      res.json({
        user: user.toJSON(),
        dataStats: {
          contacts: contactsCount,
          credentials: credentialsCount,
          goals: goalsCount,
          schedules: schedulesCount,
          numericalInfo: numericalInfoCount,
          albums: albumsCount,
          totalStorage: totalStorage || 0
        },
        recentActivity
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

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