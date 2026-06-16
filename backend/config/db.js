const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  try {
    console.log('Connecting to Primary MongoDB Database...');
    const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary Database Connection failed: ${error.message}`);
    console.log('Attempting connection to Local MongoDB fallback (mongodb://127.0.0.1:27017/right-tech)...');
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/right-tech', { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB Connected (LOCAL FALLBACK): ${conn.connection.host}`);
    } catch (localError) {
      console.error(`Fatal Database Connection Error: ${localError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
