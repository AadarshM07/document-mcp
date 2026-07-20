var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nitrostack/core';
import { DocumentsService } from './documents.service.js';
import { DocumentsTools } from './documents.tools.js';
let DocumentsModule = class DocumentsModule {
};
DocumentsModule = __decorate([
    Module({
        name: 'documents',
        description: 'Document Processing & AI Form Filling MCP module',
        controllers: [DocumentsTools],
        providers: [DocumentsService],
    })
], DocumentsModule);
export { DocumentsModule };
//# sourceMappingURL=documents.module.js.map