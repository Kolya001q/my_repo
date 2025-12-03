import serverless from 'serverless-http';
import app from '../app.js';
import mongoose from 'mongoose';
import config from '../config.js';

const DB_URL = config.mongoUri || 'mongodb://localhost:27017/Weapon';

let conn = null;

// Ensure mongoose connection is available for the lambda
async function ensureConn() {
  if (!conn) {
    conn = await mongoose.connect(DB_URL);
  }
}

export default async function handler(req, res) {
  await ensureConn();
  // serverless-http expects to export a function like this; but Vercel will use the default export below
}

export const vite = serverless(app);
export const handler = serverless(app);
