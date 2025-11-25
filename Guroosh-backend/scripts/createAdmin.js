const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/user');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@quroosh.com' });

    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'admin';
      existingAdmin.isEmailVerified = true;
      await existingAdmin.save();
      console.log('✅ Updated existing user to admin role');
    } else {
      // Create new admin user
      const admin = await User.create({
        fullName: 'Admin User',
        email: 'admin@quroosh.com',
        password: 'Admin123!',
        phoneNumber: '+1234567890',
        address: 'Admin Office',
        employmentStatus: 'Employed',
        role: 'admin',
        isAdvisor: false,
        isEmailVerified: true
      });
      console.log('✅ Admin user created successfully');
    }

    console.log('\n📝 Admin Credentials:');
    console.log('Email: admin@quroosh.com');
    console.log('Password: Admin123!');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdminUser();
