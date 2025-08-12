const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  plan_type: {
    type: DataTypes.ENUM('free', 'basic', 'premium'),
    defaultValue: 'free'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired'),
    defaultValue: 'active'
  },
  ai_requests_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ai_requests_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  storage_used: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  storage_limit: {
    type: DataTypes.BIGINT,
    defaultValue: 5368709120
  },
  starts_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expires_at: {
    type: DataTypes.DATE
  },
  cancelled_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true
});

module.exports = Subscription;