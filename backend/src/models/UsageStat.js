const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UsageStat = sequelize.define('UsageStat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action_type: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'usage_stats',
  timestamps: true,
  underscored: true,
});

module.exports = UsageStat;