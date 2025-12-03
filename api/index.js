import serverless from 'serverless-http';
import app from '../app.js';
import mongoose from 'mongoose';
import config from '../config.js';

const DB_URL = config.mongoUri || 'mongodb://localhost:27017/Weapon';

let conn = null;

// Ensure mongoose connection is available for the lambda
async function ensureConn() {
  if (conn) return;
  conn = await mongoose.connect(DB_URL);
}

const lambda = serverless(app);

// Wrapper ensures DB connection before delegating to serverless handler
export default async function (req, res) {
  try {
    await ensureConn();
  } catch (err) {
    console.error('Mongo connection error', err);
    res.statusCode = 500;
    res.end('Database connection error');
    return;
  }
  return lambda(req, res);
}

export const handler = async (req, res) => {
  return (await import('./index.js')).default(req, res);
};
