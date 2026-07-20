var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, Widget, Injectable, z } from '@nitrostack/core';
import { DocumentsService } from './documents.service.js';
const SearchDocumentsSchema = z.object({
    query: z.string().describe('The search keyword to look for in document filenames or descriptions'),
    limit: z.number().optional().default(30).describe('Maximum number of results to return. Max 30.')
});
const GetDocumentSchema = z.object({
    identifier: z.string().describe('The document ID or exact filename to retrieve')
});
let DocumentsTools = class DocumentsTools {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async searchDocuments(input, ctx) {
        ctx.logger.info(`Searching for documents with query: ${input.query}, limit: ${input.limit}`);
        try {
            return await this.documentsService.searchDocuments(input.query, input.limit);
        }
        catch (error) {
            ctx.logger.error(`Error searching documents: ${error.message}`);
            throw error;
        }
    }
    async getDocument(input, ctx) {
        ctx.logger.info(`Retrieving document: ${input.identifier}`);
        try {
            return await this.documentsService.getDocument(input.identifier);
        }
        catch (error) {
            ctx.logger.error(`Error retrieving document: ${error.message}`);
            throw error;
        }
    }
};
__decorate([
    Tool({
        name: 'search_documents',
        description: 'Search for available company documents by name or keyword.',
        inputSchema: SearchDocumentsSchema
    }),
    Widget('document-list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0, Object]),
    __metadata("design:returntype", Promise)
], DocumentsTools.prototype, "searchDocuments", null);
__decorate([
    Tool({
        name: 'get_document',
        description: 'Retrieve a specific document by its ID or exact filename.',
        inputSchema: GetDocumentSchema
    }),
    Widget('document-viewer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0, Object]),
    __metadata("design:returntype", Promise)
], DocumentsTools.prototype, "getDocument", null);
DocumentsTools = __decorate([
    Injectable({ deps: [DocumentsService] }),
    __metadata("design:paramtypes", [DocumentsService])
], DocumentsTools);
export { DocumentsTools };
//# sourceMappingURL=documents.tools.js.map