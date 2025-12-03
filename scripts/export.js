import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function oidify(obj) {
  if (Array.isArray(obj)) return obj.map(oidify);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (v && v._bsontype === 'ObjectID') {
        out[k] = { $oid: v.toString() };
      } else {
        out[k] = oidify(v);
      }
    }
    return out;
  }
  return obj;
}

async function exportDb() {
  const MONGO_URI = config.mongoUri || 'mongodb://localhost:27017/Weapon';
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  try {
    const collections = await db.listCollections().toArray();
    const outDir = path.resolve(__dirname, '..', 'db', 'exported');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    for (const col of collections) {
      if (col.name === 'sessions') continue;
      const docs = await db.collection(col.name).find().toArray();
      const converted = docs.map(oidify);
      const filePath = path.join(outDir, `${col.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(converted, null, 2), 'utf8');
      console.log(`Exported ${docs.length} docs to ${filePath}`);
    }

    console.log('Export completed');
  } catch (err) {
    console.error('Export failed', err);
  } finally {
    await mongoose.disconnect();
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  exportDb();
}

export default exportDb;
