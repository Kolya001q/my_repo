import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility to convert MongoDB export style ObjectIds in JSON ( { "$oid": "..." } )
function convertObjectIds(obj) {
  if (Array.isArray(obj)) return obj.map(convertObjectIds);
  if (obj && typeof obj === 'object') {
    if (Object.keys(obj).length === 1 && obj.$oid) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    const out = {};
    for (const k of Object.keys(obj)) {
      out[k] = convertObjectIds(obj[k]);
    }
    return out;
  }
  return obj;
}

async function seed() {
  const MONGO_URI = config.mongoUri || 'mongodb://localhost:27017/Weapon';
  console.log('Using MongoDB URI:', MONGO_URI);

  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;

  try {
    // Seed posts files in db/ (Back-end.posts.json and Back-end.tests.json)
    const postsDir = path.resolve(__dirname, '..', 'db');
    const postFiles = ['Back-end.posts.json', 'Back-end.tests.json'];

    for (const fileName of postFiles) {
      const filePath = path.join(postsDir, fileName);
      if (!fs.existsSync(filePath)) continue;
      const raw = fs.readFileSync(filePath, 'utf8');
      const docs = JSON.parse(raw);
      const converted = docs.map(convertObjectIds);
      // Use collection name based on filename without extension
      const collectionName = path.basename(fileName, path.extname(fileName)).replace(/\./g, '_');
      // Drop existing collection if exists
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length) {
        console.log(`Dropping collection ${collectionName}`);
        await db.collection(collectionName).drop();
      }
      if (converted.length) {
        console.log(`Inserting ${converted.length} documents into ${collectionName}`);
        await db.collection(collectionName).insertMany(converted);
      }
    }

    // Seed accounts
    const accountsPath = path.resolve(__dirname, '..', 'db', 'accounts', 'Back-end.accounts.json');
    if (fs.existsSync(accountsPath)) {
      const raw = fs.readFileSync(accountsPath, 'utf8');
      const docs = JSON.parse(raw).map(convertObjectIds);
      const collectionName = 'accounts';
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length) {
        console.log(`Dropping collection ${collectionName}`);
        await db.collection(collectionName).drop();
      }
      if (docs.length) {
        console.log(`Inserting ${docs.length} documents into ${collectionName}`);
        await db.collection(collectionName).insertMany(docs);
      }
    }

    console.log('Seeding completed');
  } catch (err) {
    console.error('Seeding failed', err);
  } finally {
    await mongoose.disconnect();
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  seed();
}

export default seed;
