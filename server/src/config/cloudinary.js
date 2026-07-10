const cloudinary = require('cloudinary').v2;
const env = require('./env');

const isConfigured = 
  env.CLOUDINARY_CLOUD_NAME && 
  env.CLOUDINARY_API_KEY && 
  env.CLOUDINARY_API_SECRET &&
  !env.CLOUDINARY_CLOUD_NAME.includes('your-cloud-name');

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary initialized successfully');
} else {
  console.warn('⚠️ Cloudinary keys not configured in server/.env. Using mock fallback for image uploads.');
}

// Uploads a file buffer directly to Cloudinary or returns a mock URL.
// Returns an object containing the secure URL.
async function uploadImage(fileBuffer) {
  if (!isConfigured) {
    // Generate a beautiful mock tool image using Unsplash
    const mockCategories = ['tools', 'hardware', 'construction', 'gardening', 'diy'];
    const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
    const mockId = Math.floor(Math.random() * 1000);
    const mockUrl = `https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=60&sig=${mockId}`;
    
    // Simulate a brief delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { secure_url: mockUrl };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'rent-a-tool' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

module.exports = { uploadImage };
