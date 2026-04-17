const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'Admin',
    status: 'Active'
  },
  {
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'password123',
    role: 'Manager',
    status: 'Active'
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'User',
    status: 'Active'
  }
];

const seedData = async () => {
  console.log('Connecting to MongoDB...');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    console.log('Cleaning up existing users...');
    await User.deleteMany();
    
    console.log('Creating seed users...');
    const createdUsers = await User.create(users);
    
    const admin = createdUsers.find(u => u.role === 'Admin');
    await User.updateMany({}, { createdBy: admin._id, updatedBy: admin._id });

    console.log('Data Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
