import { ExecutionContext, z } from '@nitrostack/core';
import { DocumentsService } from './documents.service.js';
declare const SearchDocumentsSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit: number;
}, {
    query: string;
    limit?: number | undefined;
}>;
declare const GetDocumentSchema: z.ZodObject<{
    identifier: z.ZodString;
}, "strip", z.ZodTypeAny, {
    identifier: string;
}, {
    identifier: string;
}>;
export declare class DocumentsTools {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    searchDocuments(input: z.infer<typeof SearchDocumentsSchema>, ctx: ExecutionContext): Promise<{
        results: {
            id: string;
            filename: any;
            length: any;
            uploadDate: any;
            metadata: any;
        }[];
    }>;
    getDocument(input: z.infer<typeof GetDocumentSchema>, ctx: ExecutionContext): Promise<unknown>;
}
export {};
//# sourceMappingURL=documents.tools.d.ts.map