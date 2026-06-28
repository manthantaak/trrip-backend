const mongoose = require('mongoose');

const connectDB = async () => {
  let rawMongoUri = process.env.MONGO_URI;

  if (rawMongoUri && rawMongoUri.startsWith('//')) {
    rawMongoUri = 'mongodb+srv:' + rawMongoUri;
  }

  const mongoUri = rawMongoUri && /^(mongodb:\/\/|mongodb\+srv:\/\/)/i.test(rawMongoUri)
    ? rawMongoUri
    : 'mongodb://127.0.0.1:27017/trrip';

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
};

module.exports = connectDB;
