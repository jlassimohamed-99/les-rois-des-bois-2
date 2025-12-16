import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'ENV_SETUP.md');

// Default environment variables (development-friendly)
const defaultEnv = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/les-rois-des-bois
JWT_SECRET=${generateRandomSecret()}
JWT_EXPIRE=7d
NODE_ENV=development
`;

function generateRandomSecret() {
  return crypto.randomBytes(64).toString('hex');
}

try {
  // Check if .env file exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    // Check if JWT_SECRET is set
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('JWT_SECRET=') && !envContent.includes('JWT_SECRET=your-super-secret')) {
      console.log('✅ JWT_SECRET is already configured');
      process.exit(0);
    } else {
      console.log('⚠️  JWT_SECRET is missing or using default value');
      console.log('📝 Please update your .env file with a secure JWT_SECRET');
    }
  } else {
    // Create .env file
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Created .env file with default values');
    console.log('⚠️  IMPORTANT: Please review and update the .env file if needed');
    console.log('📝 See backend/ENV_SETUP.md for more details');
  }
} catch (error) {
  console.error('❌ Error setting up .env file:', error.message);
  process.exit(1);
}

