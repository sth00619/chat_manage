const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Credential = sequelize.define('Credential', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  website: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'credentials',
  timestamps: true,
  underscored: true,
});

module.exports = Credential;