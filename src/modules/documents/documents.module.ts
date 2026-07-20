import { Module } from '@nitrostack/core';
import { DocumentsService } from './documents.service.js';
import { DocumentsTools } from './documents.tools.js';

@Module({
    name: 'documents',
    description: 'Document Processing & AI Form Filling MCP module',
    controllers: [DocumentsTools],
    providers: [DocumentsService],
})
export class DocumentsModule { }
