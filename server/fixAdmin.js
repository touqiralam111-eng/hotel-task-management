const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./models/User');

    // Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Update or create admin
    const user = await User.findOneAndUpdate(
      { email: 'touqiralam79@gmail.com' },
      {
        name: 'Touqir Alam',
        email: 'touqiralam79@gmail.com',
        password: hashedPassword,
        role: 'admin',
        department: 'Management',
        phone: '1234567890',
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin user ready!');
    console.log('📧 Email: touqiralam79@gmail.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role:', user.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAdmin();