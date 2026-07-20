import { OnModuleInit, OnApplicationShutdown } from '@nitrostack/core';
export declare class DocumentsService implements OnModuleInit, OnApplicationShutdown {
    private client;
    private db;
    private bucket;
    onModuleInit(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    searchDocuments(query: string, limit?: number): Promise<{
        results: {
            id: string;
            filename: any;
            length: any;
            uploadDate: any;
            metadata: any;
        }[];
    }>;
    getDocument(identifier: string): Promise<unknown>;
}
//# sourceMappingURL=documents.service.d.ts.map