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
import { FormsService } from './forms.service.js';
const ListFormsSchema = z.object({
    query: z.string().describe('The search keyword to look for forms title or description'),
    limit: z.number().optional().default(30).describe('Maximum number of results to return. Max 30.')
});
const StartFormSchema = z.object({
    formId: z.string().describe('The ID or exact name of the form to start')
});
const GetNextQuestionSchema = z.object({
    sessionId: z.string().describe('The session ID returned from start_form')
});
const SaveAnswerSchema = z.object({
    sessionId: z.string().describe('The session ID returned from start_form'),
    questionId: z.string().describe('The ID of the question being answered'),
    answer: z.any().describe('The answer provided by the user')
});
const SubmitFormSchema = z.object({
    sessionId: z.string().describe('The session ID of the form to submit')
});
const GetFormDocumentSchema = z.object({
    documentId: z.string().describe('The documentId returned by submit_form once the submission PDF has been generated')
});
let FormsTools = class FormsTools {
    formsService;
    constructor(formsService) {
        this.formsService = formsService;
    }
    async listForms(input, ctx) {
        ctx.logger.info(`Listing forms with query: ${input.query}, limit: ${input.limit}`);
        try {
            return await this.formsService.listForms(input.query, input.limit);
        }
        catch (error) {
            ctx.logger.error(`Error listing forms: ${error.message}`);
            throw error;
        }
    }
    async startForm(input, ctx) {
        ctx.logger.info(`Starting form: ${input.formId}`);
        try {
            return await this.formsService.startForm(input.formId);
        }
        catch (error) {
            ctx.logger.error(`Error starting form: ${error.message}`);
            throw error;
        }
    }
    async getNextQuestion(input, ctx) {
        ctx.logger.info(`Getting next question for session: ${input.sessionId}`);
        try {
            return await this.formsService.getNextQuestion(input.sessionId);
        }
        catch (error) {
            ctx.logger.error(`Error getting next question: ${error.message}`);
            throw error;
        }
    }
    async saveAnswer(input, ctx) {
        ctx.logger.info(`Saving answer for question: ${input.questionId} in session: ${input.sessionId}`);
        try {
            return await this.formsService.saveAnswer(input.sessionId, input.questionId, input.answer);
        }
        catch (error) {
            ctx.logger.error(`Error saving answer: ${error.message}`);
            throw error;
        }
    }
    async submitForm(input, ctx) {
        ctx.logger.info(`Submitting form for session: ${input.sessionId}`);
        try {
            return await this.formsService.submitForm(input.sessionId);
        }
        catch (error) {
            ctx.logger.error(`Error submitting form: ${error.message}`);
            throw error;
        }
    }
    async getFormDocument(input, ctx) {
        ctx.logger.info(`Fetching form document: ${input.documentId}`);
        try {
            return await this.formsService.getFormDocument(input.documentId);
        }
        catch (error) {
            ctx.logger.error(`Error fetching form document: ${error.message}`);
            throw error;
        }
    }
};
__decorate([
    Tool({
        name: 'list_forms',
        description: 'Retrieve all available forms by name or keyword',
        inputSchema: ListFormsSchema
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0, Object]),
    __metadata("design:returntype", Promise)
], FormsTools.prototype, "listForms", null);
__decorate([
    Tool({
        name: 'start_form',
        description: 'Start a new session to fill out a form',
        inputSchema: StartFormSchema
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0, Object]),
    __metadata("design:returntype", Promise)
], FormsTools.prototype, "startForm", null);
__decorate([
    Tool({
        name: 'get_next_question',
        description: 'Get the next unanswered question for an active form session',
        inputSchema: GetNextQuestionSchema
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0, Object]),
    __metadata("design:returntype", Promise)
], FormsTools.prototype, "getNextQuestion", null);
__decorate([
    Tool({
        name: 'save_answer',
        description: 'Save an answer to a question in an active form session',
        inputSchema: SaveAnswerSchema
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0, Object]),
    __metadata("design:returntype", Promise)
], FormsTools.prototype, "saveAnswer", null);
__decorate([
    Tool({
        name: 'submit_form',
        description: 'Submit an active form session if all required fields are complete. On success this generates a ' +
            'summary PDF (title, submission date, and every question/answer) and stores it in MongoDB. The response ' +
            'includes a documentId — call get_form_document with that id to retrieve and display the generated PDF.',
        inputSchema: SubmitFormSchema
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0, Object]),
    __metadata("design:returntype", Promise)
], FormsTools.prototype, "submitForm", null);
__decorate([
    Tool({
        name: 'get_form_document',
        description: 'Retrieve the generated submission PDF for a form (title, submission date, and question/answer pairs). ' +
            'Use the documentId returned by submit_form. Renders as a document card.',
        inputSchema: GetFormDocumentSchema
    }),
    Widget('document-viewer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0, Object]),
    __metadata("design:returntype", Promise)
], FormsTools.prototype, "getFormDocument", null);
FormsTools = __decorate([
    Injectable({ deps: [FormsService] }),
    __metadata("design:paramtypes", [FormsService])
], FormsTools);
export { FormsTools };
//# sourceMappingURL=forms.tools.js.map