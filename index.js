import mongoose from 'mongoose';
import app from './app.js';
import config from './config.js';

const PORT = process.env.PORT || 5000;
const DB_URL = config.mongoUri || 'mongodb://localhost:27017/Weapon';

async function startApp() {
    try {
        await mongoose.connect(DB_URL);
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.error('Failed to start app', e);
    }
}

if (process.env.VERCEL !== '1') startApp();

export default app;