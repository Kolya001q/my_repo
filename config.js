import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = {
  mongoUri: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET || 'your_secret_key'
};

export default config;
