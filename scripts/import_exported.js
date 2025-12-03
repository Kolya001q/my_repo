import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function importExported() {
  const MONGO_URI = config.mongoUri || 'mongodb://localhost:27017/Weapon';
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  try {
    const exportedDir = path.resolve(__dirname, '..', 'db', 'exported');
    if (!fs.existsSync(exportedDir)) {
      console.error('No exported dir found at', exportedDir);
      return;
    }

    const files = fs.readdirSync(exportedDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(exportedDir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const docs = JSON.parse(raw).map(convertObjectIds);
      const collectionName = path.basename(file, path.extname(file));
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length) {
        console.log(`Dropping existing collection ${collectionName}`);
        await db.collection(collectionName).drop();
      }
      if (docs.length) {
        console.log(`Inserting ${docs.length} documents into ${collectionName}`);
        await db.collection(collectionName).insertMany(docs);
      }
    }

    console.log('Import completed');
  } catch (err) {
    console.error('Import failed', err);
  } finally {
    await mongoose.disconnect();
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  importExported();
}

export default importExported;
