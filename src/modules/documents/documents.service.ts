import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nitrostack/core';
import { MongoClient, Db, GridFSBucket, ObjectId } from 'mongodb';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class DocumentsService implements OnModuleInit, OnApplicationShutdown {
    private client!: MongoClient;
    private db!: Db;
    private bucket!: GridFSBucket;

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

    async searchDocuments(query: string, limit: number = 30) {
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
        } catch (error: any) {
            throw new Error(`Failed to search documents: ${error.message}`);
        }
    }

    async getDocument(identifier: string) {
        try {
            let fileDoc = null;
            try {
                if (ObjectId.isValid(identifier)) {
                    fileDoc = await this.db.collection('documents.files').findOne({ _id: new ObjectId(identifier) });
                }
            } catch(e) {}

            if (!fileDoc) {
                fileDoc = await this.db.collection('documents.files').findOne({ filename: identifier });
            }

            if (!fileDoc) {
                throw new Error(`Document not found: ${identifier}`);
            }

            const downloadStream = this.bucket.openDownloadStream(fileDoc._id);
            
            return new Promise((resolve, reject) => {
                const chunks: any[] = [];
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
                        } catch (err) {
                            console.error('Failed to parse PDF', err);
                        }
                    }

                    resolve({
                        metadata: fileDoc,
                        content
                    });
                });
            });
        } catch (error: any) {
            throw new Error(`Failed to retrieve document: ${error.message}`);
        }
    }
}
