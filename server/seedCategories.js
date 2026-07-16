const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const categories = [
  { name: "Housekeeping", description: "Room cleaning and maintenance tasks", color: "#3B82F6", icon: "house", isActive: true },
  { name: "Reception", description: "Front desk and guest services", color: "#8B5CF6", icon: "reception", isActive: true },
  { name: "Maintenance", description: "Repairs and facility maintenance", color: "#F59E0B", icon: "wrench", isActive: true },
  { name: "Kitchen", description: "Food preparation and kitchen tasks", color: "#EF4444", icon: "kitchen", isActive: true },
  { name: "Laundry", description: "Laundry and linen services", color: "#10B981", icon: "laundry", isActive: true },
  { name: "Security", description: "Security and surveillance tasks", color: "#6366F1", icon: "security", isActive: true }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories (optional)
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert categories
    const result = await Category.insertMany(categories);
    console.log(`✅ ${result.length} categories seeded successfully!`);
    console.log(result);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();