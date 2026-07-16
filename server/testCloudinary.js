const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary with CORRECT credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'lalrkrxnl',
  api_key: process.env.CLOUDINARY_API_KEY || '992413366743292',
  api_secret: process.env.CLOUDINARY_API_SECRET  // This must be the actual secret
});

console.log('Testing Cloudinary connection...');
console.log('Cloud Name:', cloudinary.config().cloud_name);
console.log('API Key:', cloudinary.config().api_key ? 'Set' : 'Missing');
console.log('API Secret:', cloudinary.config().api_secret ? 'Set (length: ' + cloudinary.config().api_secret.length + ')' : 'Missing');

// Test upload with sample image
async function testUpload() {
  try {
    console.log('Attempting to upload to Cloudinary...');
    const result = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      { 
        folder: 'test',
        public_id: 'test-upload'
      }
    );
    console.log('✅ Cloudinary upload successful!');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    console.log('Please check your API credentials');
    console.log('Cloud Name should be: lalrkrxnl');
    console.log('API Key should be: 992413366743292');
    console.log('API Secret should be the actual secret from dashboard');
  }
}

testUpload();