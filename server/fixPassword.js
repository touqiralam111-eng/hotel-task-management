const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const fixPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');
    
    // Your desired password
    const newPassword = "@123@TOUQIR@@";
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user
    const user = await User.findOneAndUpdate(
      { email: "touqiralam79@gmail.com" },
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
      console.log('🔑 New Password:', newPassword);
      console.log('👤 Role:', user.role);
    } else {
      console.log('❌ User not found!');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixPassword();