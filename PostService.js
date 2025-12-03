import mongoose from 'mongoose';
import config from './config.js';
import * as path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import postSchema from './PostScheme.js'
import fs from 'fs'
import xlsx from 'xlsx'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PostService {
    constructor() {
        this.connection = null;
    }

    async connect() {
        if (!this.connection) {
            const mongoUri = config.mongoUri || 'mongodb://localhost:27017/Weapon';
            this.connection = await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        }
    }

    getModel(collectionName) {
        return mongoose.model(collectionName, postSchema);
    }

    async create(post, collectionName) {
        await this.connect();
        const PostModel =  await this.getModel(collectionName);
        const createdPost = await PostModel.create(post);
        return createdPost;
    }

    async getCollections(req, res) {
        try {
            await this.connect();
            const db = this.connection.connection.db;
            let collections = await db.listCollections().toArray();
            collections.sort((a, b) => a.name.localeCompare(b.name));
            collections = collections.filter(collection => collection.name !== 'accounts'&&collection.name !== 'sessions');
            return collections;
        } catch (e) {
            res.status(500).json(e.message);
        }
    }

    async getCollection(collectionName) {
        try {
            await this.connect();
            const db = this.connection.connection.db;
            const collection = await db.collection(collectionName).find().toArray();
            return collection;
        } catch (e) {
            res.status(500).json(e.message);
        }
    }

    async edit(id, collectionName) {
        await this.connect();
        const PostModel = this.getModel(collectionName);
        const document = await PostModel.findOne({ _id: id }).exec();
        console.log(document);
        return document;
    }

    async update(post, collectionName) {
        const updateData = post;
        delete updateData.id;

        if (!post._id) {
            throw new Error('Wrong ID');
        }
        await this.connect();
        const PostModel = this.getModel(collectionName);
        const updatedPost = await PostModel.findByIdAndUpdate(post._id, post, { new: true });
        return updatedPost;
    }

    async delete(collectionName, id) {
        await this.connect();
        const db = this.connection.connection.db;
        const collection = db.collection(collectionName);
        const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

        return result;
    }
    async export(collectionName) {
        await this.connect();
        const db = this.connection.connection.db;
        const documents = await db.collection(collectionName).find().toArray();

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(documents, {
            header: ['rank', 'name', 'lastName', 'assaultRifle', 'serialNumberAssaultRifle', 'pistol', 'serialNumberPistol'],
            skipHeader: false
        });
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const outputFilePath = path.resolve(__dirname, 'duty.xlsx');
        xlsx.writeFile(workbook, outputFilePath);

        return { fs, outputFilePath };
    }
}

export default new PostService();
