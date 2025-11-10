require('dotenv').config();

module.exports = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/contactbook',
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development'
};