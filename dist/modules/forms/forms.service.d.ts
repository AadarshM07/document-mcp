import { OnModuleInit, OnApplicationShutdown } from '@nitrostack/core';
import { ObjectId } from 'mongodb';
import { FormsPdfService } from './forms.pdf.services.js';
export interface FormSession {
    _id?: ObjectId;
    formId: string;
    status: 'in_progress' | 'submitted';
    answers: Record<string, any>;
    documentId?: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare class FormsService implements OnModuleInit, OnApplicationShutdown {
    private readonly pdfService;
    private client;
    private db;
    private formDocsBucket;
    constructor(pdfService: FormsPdfService);
    onModuleInit(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    listForms(query: string, limit?: number): Promise<{
        results: {
            id: string;
            name: any;
            description: any;
            category: any;
            questionCount: number;
        }[];
    }>;
    startForm(formId: string): Promise<{
        sessionId: string;
        formName: any;
        description: any;
        message: string;
    }>;
    getNextQuestion(sessionId: string): Promise<{
        message: string;
        complete: boolean;
        questionId?: undefined;
        question?: undefined;
        type?: undefined;
        options?: undefined;
    } | {
        questionId: any;
        question: any;
        type: any;
        options: any;
        complete: boolean;
        message?: undefined;
    }>;
    saveAnswer(sessionId: string, questionId: string, answer: any): Promise<{
        success: boolean;
        message: string;
    }>;
    submitForm(sessionId: string): Promise<{
        success: boolean;
        message: string;
        documentId: any;
        filename?: undefined;
    } | {
        success: boolean;
        message: string;
        documentId: string;
        filename: string;
    }>;
    getFormDocument(documentId: string): Promise<{
        metadata: {
            id: string;
            filename: any;
            length: any;
            uploadDate: any;
        };
        dataBase64: string;
    }>;
    private formatAnswer;
    private slugify;
}
//# sourceMappingURL=forms.service.d.ts.map