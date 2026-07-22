var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nitrostack/core';
import { MongoClient, ObjectId, GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { FormsPdfService } from './forms.pdf.services.js';
let FormsService = class FormsService {
    pdfService;
    client;
    db;
    formDocsBucket;
    constructor(pdfService) {
        this.pdfService = pdfService;
    }
    async onModuleInit() {
        const uri = process.env.MONGODB_URL;
        if (!uri) {
            throw new Error('MONGODB_URL environment variable is not defined');
        }
        this.client = new MongoClient(uri);
        await this.client.connect();
        this.db = this.client.db('document-mcp');
        this.formDocsBucket = new GridFSBucket(this.db, { bucketName: 'form-documents' });
        console.error('Connected to MongoDB for FormsService (GridFS bucket: form-documents).');
    }
    async onApplicationShutdown() {
        if (this.client) {
            await this.client.close();
            console.error('Disconnected from MongoDB in FormsService.');
        }
    }
    async listForms(query, limit = 30) {
        try {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedQuery, 'i');
            const forms = await this.db.collection('forms').find({
                $or: [
                    { name: { $regex: regex } },
                    { description: { $regex: regex } }
                ]
            }).limit(limit).toArray();
            return {
                results: forms.map(form => ({
                    id: form._id.toString(),
                    name: form.name,
                    description: form.description,
                    category: form.category,
                    questionCount: Array.isArray(form.questions) ? form.questions.length : 0
                }))
            };
        }
        catch (error) {
            throw new Error(`Failed to list forms: ${error.message}`);
        }
    }
    async startForm(formId) {
        try {
            let formDoc = null;
            try {
                if (ObjectId.isValid(formId)) {
                    formDoc = await this.db.collection('forms').findOne({ _id: new ObjectId(formId) });
                }
            }
            catch (e) { }
            if (!formDoc) {
                formDoc = await this.db.collection('forms').findOne({ name: formId });
            }
            if (!formDoc) {
                throw new Error(`Form not found: ${formId}`);
            }
            const session = {
                formId: formDoc._id.toString(),
                status: 'in_progress',
                answers: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await this.db.collection('form_sessions').insertOne(session);
            return {
                sessionId: result.insertedId.toString(),
                formName: formDoc.name,
                description: formDoc.description,
                message: "Form session started. Use get_next_question to begin answering."
            };
        }
        catch (error) {
            throw new Error(`Failed to start form: ${error.message}`);
        }
    }
    async getNextQuestion(sessionId) {
        try {
            if (!ObjectId.isValid(sessionId)) {
                throw new Error("Invalid sessionId format");
            }
            const session = await this.db.collection('form_sessions').findOne({ _id: new ObjectId(sessionId) });
            if (!session) {
                throw new Error(`Session not found: ${sessionId}`);
            }
            if (session.status === 'submitted') {
                return { message: "Form has already been submitted.", complete: true };
            }
            const formDoc = await this.db.collection('forms').findOne({ _id: new ObjectId(session.formId) });
            if (!formDoc || !formDoc.questions) {
                throw new Error("Form or questions not found");
            }
            for (const question of formDoc.questions) {
                if (question.required && (session.answers[question.id] === undefined || session.answers[question.id] === null || session.answers[question.id] === '')) {
                    return {
                        questionId: question.id,
                        question: question.question,
                        type: question.type,
                        options: question.options,
                        complete: false
                    };
                }
            }
            return {
                message: "All required questions have been answered. You can now submit the form.",
                complete: true
            };
        }
        catch (error) {
            throw new Error(`Failed to get next question: ${error.message}`);
        }
    }
    async saveAnswer(sessionId, questionId, answer) {
        try {
            if (!ObjectId.isValid(sessionId)) {
                throw new Error("Invalid sessionId format");
            }
            const session = await this.db.collection('form_sessions').findOne({ _id: new ObjectId(sessionId) });
            if (!session) {
                throw new Error(`Session not found: ${sessionId}`);
            }
            if (session.status === 'submitted') {
                throw new Error("Cannot modify a submitted form.");
            }
            const formDoc = await this.db.collection('forms').findOne({ _id: new ObjectId(session.formId) });
            if (!formDoc) {
                throw new Error("Associated form not found.");
            }
            const questionDef = formDoc.questions.find((q) => q.id === questionId);
            if (!questionDef) {
                throw new Error(`Question ID ${questionId} not found in form.`);
            }
            if (questionDef.type === 'select' && questionDef.options && !questionDef.options.includes(answer)) {
                throw new Error(`Invalid option. Valid options are: ${questionDef.options.join(', ')}`);
            }
            const updatedAnswers = { ...session.answers, [questionId]: answer };
            await this.db.collection('form_sessions').updateOne({ _id: new ObjectId(sessionId) }, {
                $set: {
                    answers: updatedAnswers,
                    updatedAt: new Date()
                }
            });
            return {
                success: true,
                message: `Answer saved for ${questionId}. Use get_next_question to continue.`
            };
        }
        catch (error) {
            throw new Error(`Failed to save answer: ${error.message}`);
        }
    }
    async submitForm(sessionId) {
        try {
            if (!ObjectId.isValid(sessionId)) {
                throw new Error("Invalid sessionId format");
            }
            const session = await this.db.collection('form_sessions').findOne({ _id: new ObjectId(sessionId) });
            if (!session) {
                throw new Error(`Session not found: ${sessionId}`);
            }
            if (session.status === 'submitted') {
                // Already submitted - if a document exists, still hand its id back
                // so the caller can display it again without regenerating it.
                return {
                    success: true,
                    message: "Form was already submitted.",
                    documentId: session.documentId ? session.documentId.toString() : undefined
                };
            }
            const formDoc = await this.db.collection('forms').findOne({ _id: new ObjectId(session.formId) });
            if (!formDoc) {
                throw new Error("Associated form not found.");
            }
            // Verify required fields
            const missing = [];
            for (const question of formDoc.questions) {
                if (question.required) {
                    const ans = session.answers[question.id];
                    if (ans === undefined || ans === null || ans === '') {
                        missing.push(question.id);
                    }
                }
            }
            if (missing.length > 0) {
                throw new Error(`Cannot submit form. Missing required answers for: ${missing.join(', ')}`);
            }
            const submittedAt = new Date();
            await this.db.collection('form_sessions').updateOne({ _id: new ObjectId(sessionId) }, {
                $set: {
                    status: 'submitted',
                    updatedAt: submittedAt
                }
            });
            // Build the question/answer pairs in question order for the PDF.
            const qa = formDoc.questions.map((q) => ({
                question: q.question,
                answer: this.formatAnswer(session.answers[q.id])
            }));
            const pdfBuffer = await this.pdfService.generateFormPdf({
                title: formDoc.name,
                date: submittedAt,
                formDescription: formDoc.description,
                qa
            });
            const filename = `${this.slugify(formDoc.name)}-${sessionId}.pdf`;
            // Store PDF in GridFS so it can be streamed back as binary.
            const uploadStream = this.formDocsBucket.openUploadStream(filename, {
                metadata: {
                    sessionId,
                    formId: session.formId,
                    formName: formDoc.name,
                    contentType: 'application/pdf',
                    createdAt: submittedAt.toISOString()
                },
            });
            await new Promise((resolve, reject) => {
                const readable = Readable.from(pdfBuffer);
                readable.pipe(uploadStream);
                uploadStream.on('finish', resolve);
                uploadStream.on('error', reject);
            });
            const documentId = uploadStream.id;
            // Link the generated document back onto the session for easy lookup.
            await this.db.collection('form_sessions').updateOne({ _id: new ObjectId(sessionId) }, { $set: { documentId: documentId, updatedAt: new Date() } });
            return {
                success: true,
                message: `Form successfully submitted and saved. A summary PDF (documentId: ${documentId.toString()}) was generated. Call get_form_document with this documentId to retrieve and display it.`,
                documentId: documentId.toString(),
                filename
            };
        }
        catch (error) {
            throw new Error(`Failed to submit form: ${error.message}`);
        }
    }
    async getFormDocument(documentId) {
        try {
            if (!ObjectId.isValid(documentId)) {
                throw new Error("Invalid documentId format");
            }
            // Look up the file metadata from GridFS
            const filesColl = this.db.collection('form-documents.files');
            const fileDoc = await filesColl.findOne({ _id: new ObjectId(documentId) });
            if (!fileDoc) {
                throw new Error(`Document not found: ${documentId}`);
            }
            // Stream the PDF bytes out of GridFS
            const downloadStream = this.formDocsBucket.openDownloadStream(new ObjectId(documentId));
            const buffer = await new Promise((resolve, reject) => {
                const chunks = [];
                downloadStream.on('data', (chunk) => chunks.push(chunk));
                downloadStream.on('error', reject);
                downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
            });
            const dataBase64 = buffer.toString('base64');
            return {
                // metadata shape matches DocumentMetadata in the document-viewer widget
                metadata: {
                    id: fileDoc._id.toString(),
                    filename: fileDoc.filename,
                    length: fileDoc.length,
                    uploadDate: fileDoc.uploadDate instanceof Date
                        ? fileDoc.uploadDate.toISOString()
                        : fileDoc.uploadDate,
                },
                // base64-encoded PDF bytes — the viewer renders this in an iframe
                dataBase64,
            };
        }
        catch (error) {
            throw new Error(`Failed to get form document: ${error.message}`);
        }
    }
    formatAnswer(answer) {
        if (answer === undefined || answer === null || answer === '') {
            return '(no answer provided)';
        }
        if (Array.isArray(answer)) {
            return answer.join(', ');
        }
        if (typeof answer === 'object') {
            return JSON.stringify(answer);
        }
        return String(answer);
    }
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .slice(0, 60) || 'form';
    }
};
FormsService = __decorate([
    Injectable({ deps: [FormsPdfService] }),
    __metadata("design:paramtypes", [FormsPdfService])
], FormsService);
export { FormsService };
//# sourceMappingURL=forms.service.js.map