var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nitrostack/core';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { PDFParse } from 'pdf-parse';
let DocumentsService = class DocumentsService {
    client;
    db;
    bucket;
    async onModuleInit() {
        const uri = process.env.MONGODB_URL;
        if (!uri) {
            throw new Error('MONGODB_URL environment variable is not defined');
        }
        this.client = new MongoClient(uri);
        await this.client.connect();
        this.db = this.client.db('document-mcp');
        this.bucket = new GridFSBucket(this.db, { bucketName: 'documents' });
        console.error('Connected to MongoDB and initialized GridFS bucket for documents.');
    }
    async onApplicationShutdown() {
        if (this.client) {
            await this.client.close();
            console.error('Disconnected from MongoDB.');
        }
    }
    async searchDocuments(query, limit = 30) {
        try {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedQuery, 'i');
            const files = await this.db.collection('documents.files').find({
                $or: [
                    { filename: { $regex: regex } },
                    { 'metadata.description': { $regex: regex } }
                ]
            }).limit(limit).toArray();
            return {
                results: files.map(file => ({
                    id: file._id.toString(),
                    filename: file.filename,
                    length: file.length,
                    uploadDate: file.uploadDate,
                    metadata: file.metadata
                }))
            };
        }
        catch (error) {
            throw new Error(`Failed to search documents: ${error.message}`);
        }
    }
    async getDocument(identifier) {
        try {
            let fileDoc = null;
            try {
                if (ObjectId.isValid(identifier)) {
                    fileDoc = await this.db.collection('documents.files').findOne({ _id: new ObjectId(identifier) });
                }
            }
            catch (e) { }
            if (!fileDoc) {
                fileDoc = await this.db.collection('documents.files').findOne({ filename: identifier });
            }
            if (!fileDoc) {
                throw new Error(`Document not found: ${identifier}`);
            }
            const downloadStream = this.bucket.openDownloadStream(fileDoc._id);
            return new Promise((resolve, reject) => {
                const chunks = [];
                downloadStream.on('data', chunk => chunks.push(chunk));
                downloadStream.on('error', reject);
                downloadStream.on('end', async () => {
                    const buffer = Buffer.concat(chunks);
                    let content = buffer.toString('utf-8');
                    if (fileDoc.filename.toLowerCase().endsWith('.pdf')) {
                        try {
                            const parser = new PDFParse({ data: buffer });
                            const pdfData = await parser.getText();
                            content = pdfData.text;
                            await parser.destroy();
                        }
                        catch (err) {
                            console.error('Failed to parse PDF', err);
                        }
                    }
                    resolve({
                        metadata: fileDoc,
                        content
                    });
                });
            });
        }
        catch (error) {
            throw new Error(`Failed to retrieve document: ${error.message}`);
        }
    }
};
DocumentsService = __decorate([
    Injectable()
], DocumentsService);
export { DocumentsService };
//# sourceMappingURL=documents.service.js.map