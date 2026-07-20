import 'dotenv/config';
import { MongoClient, GridFSBucket } from 'mongodb';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadPdfToGridFS() {
    const uri = process.env.MONGODB_URL;
    if (!uri) {
        console.error('Error: MONGODB_URL is not set in .env');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    const inputPath = process.argv[2];
    if (!inputPath) {
        console.error("Usage: node upload-pdf.js <path-to-pdf-file>");
        process.exit(1);
    }

    const filePath = path.resolve(process.cwd(), inputPath);
    const pdfFilename = path.basename(filePath);

    try {
        if (!fs.existsSync(filePath)) {
            console.error(`Error: File not found at ${filePath}`);
            return;
        }

        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Successfully connected.');

        const db = client.db('document-mcp');
        const bucket = new GridFSBucket(db, { bucketName: 'documents' });

        console.log(`Starting upload of ${pdfFilename} into GridFS...`);

        const readStream = fs.createReadStream(filePath);
        
        const uploadStream = bucket.openUploadStream(pdfFilename, {
            contentType: 'application/pdf',
            metadata: { description: 'A test PDF document uploaded via test script' }
        });

        readStream.pipe(uploadStream);

        await new Promise((resolve, reject) => {
            uploadStream.on('error', (error) => {
                console.error('Upload failed:', error);
                reject(error);
            });
            uploadStream.on('finish', () => {
                console.log(`Upload complete! File ID: ${uploadStream.id}`);
                resolve(null);
            });
        });

    } catch (error) {
        console.error('An error occurred during the upload process:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

uploadPdfToGridFS();
