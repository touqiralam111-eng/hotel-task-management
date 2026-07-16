const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const updatePassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = "touqiralam79@gmail.com";
    const newPassword = "@123@TOUQIR@@";

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user
    const user = await User.findOneAndUpdate(
      { email: email },
      { 
        $set: { 
          password: hashedPassword,
          role: "admin",
          isActive: true
        } 
      },
      { new: true }
    );

    if (user) {
      console.log('✅ Password updated successfully!');
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🔑 Role:', user.role);
      console.log('📝 New Password:', newPassword);
    } else {
      console.log('❌ User not found. Creating new admin user...');
      
      // Create new admin user
      const newUser = await User.create({
        name: "Touqir Alam",
        email: email,
        password: hashedPassword,
        role: "admin",
        department: "Management",
        phone: "1234567890",
        isActive: true,
        settings: {
          theme: "light",
          notifications: true,
          emailAlerts: true
        }
      });
      console.log('✅ Admin user created!');
      console.log('📧 Email:', newUser.email);
      console.log('🔑 Password:', newPassword);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updatePassword();