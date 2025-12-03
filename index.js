import express from 'express';
import mongoose from 'mongoose';
import router from './router.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read MongoDB URI from environment via config; default to local for dev
const DB_URL = config.mongoUri || 'mongodb://localhost:27017/Weapon';
const PORT = process.env.PORT || 5000;

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: DB_URL }),
    cookie: { secure: false }
}));

app.use(express.urlencoded({ extended: true }));
const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.json());

app.use((req, res, next) => {
    console.log('Session:', req.session);
    next();
});

app.use('/api', router);

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

startApp();

export default DB_URL;