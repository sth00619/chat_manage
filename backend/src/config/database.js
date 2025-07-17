const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    timezone: '+09:00', // 한국 시간대 설정
    dialectOptions: {
      dateStrings: true,
      typeCast: function (field, next) {
        // DATETIME 필드를 문자열로 반환
        if (field.type === 'DATETIME') {
          return field.string();
        }
        return next();
      }
    }
  }
);

module.exports = sequelize;