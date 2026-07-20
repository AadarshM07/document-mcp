import { ToolDecorator as Tool,  Widget, ExecutionContext, Injectable, z } from '@nitrostack/core';
import { DocumentsService } from './documents.service.js';

const SearchDocumentsSchema = z.object({
    query: z.string().describe('The search keyword to look for in document filenames or descriptions'),
    limit: z.number().optional().default(30).describe('Maximum number of results to return. Max 30.')
});

const GetDocumentSchema = z.object({
    identifier: z.string().describe('The document ID or exact filename to retrieve')
});


@Injectable({ deps: [DocumentsService] })
export class DocumentsTools {
    constructor(private readonly documentsService: DocumentsService) {}

    @Tool({
        name: 'search_documents',
        description: 'Search for available company documents by name or keyword.',
        inputSchema: SearchDocumentsSchema
    })
    @Widget('document-list')
    async searchDocuments(input: z.infer<typeof SearchDocumentsSchema>, ctx: ExecutionContext) {
        ctx.logger.info(`Searching for documents with query: ${input.query}, limit: ${input.limit}`);
        try {
            return await this.documentsService.searchDocuments(input.query, input.limit);
        } catch (error: any) {
            ctx.logger.error(`Error searching documents: ${error.message}`);
            throw error;
        }
    }

    @Tool({
        name: 'get_document',
        description: 'Retrieve a specific document by its ID or exact filename.',
        inputSchema: GetDocumentSchema
    })
    @Widget('document-viewer')
    async getDocument(input: z.infer<typeof GetDocumentSchema>, ctx: ExecutionContext) {
        ctx.logger.info(`Retrieving document: ${input.identifier}`);
        try {
            return await this.documentsService.getDocument(input.identifier);
        } catch (error: any) {
            ctx.logger.error(`Error retrieving document: ${error.message}`);
            throw error;
        }
    }


}
