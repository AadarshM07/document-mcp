import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { FormsModule } from './modules/forms/forms.module.js';

/**
 * Root Application Module
 * 
 * Document Processing & AI Form Filling MCP.
 */
@McpApp({
    module: AppModule,
    server: {
        name: 'document-mcp',
        version: '1.0.0'
    },
    logging: {
        level: 'info'
    }
})
@Module({
    name: 'document-root',
    description: 'Document MCP root module',
    imports: [
        ConfigModule.forRoot(),
        DocumentsModule,
        FormsModule
    ],
})
export class AppModule { }
