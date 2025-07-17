const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NumericalInfo = sequelize.define('NumericalInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
  },
  label: {
    type: DataTypes.STRING,
  },
  value: {
    type: DataTypes.STRING,
  },
  unit: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'numerical_info',
  timestamps: true,
  underscored: true,
});

module.exports = NumericalInfo;