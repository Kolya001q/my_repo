import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import router from './Router.js';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_URL = config.mongoUri || 'mongodb://localhost:27017/Weapon';

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
    // lightweight request session logging in dev only
    if (process.env.NODE_ENV !== 'production') console.log('Session:', req.session);
    next();
});

app.use('/api', router);

export default app;
