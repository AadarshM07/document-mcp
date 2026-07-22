import { ToolDecorator as Tool,  Widget, ExecutionContext, Injectable, z } from '@nitrostack/core';
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

const GetPreviousQuestionSchema = z.object({
    sessionId: z.string().describe('The session ID returned from start_form')
});

const GetFormDocumentSchema = z.object({
    documentId: z.string().describe('The documentId returned by submit_form once the submission PDF has been generated')
});

@Injectable({ deps: [FormsService] })
export class FormsTools {
    constructor(private readonly formsService: FormsService) {}

    @Tool({
        name: 'list_forms',
        description: 'Retrieve all available forms by name or keyword',
        inputSchema: ListFormsSchema
    })
    async listForms(input: z.infer<typeof ListFormsSchema>, ctx: ExecutionContext) {
        ctx.logger.info(`Listing forms with query: ${input.query}, limit: ${input.limit}`);
        try {
            return await this.formsService.listForms(input.query, input.limit);
        } catch (error: any) {
            ctx.logger.error(`Error listing forms: ${error.message}`);
            throw error;
        }
    }

    @Tool({
        name: 'start_form',
        description: 'Start a new session to fill out a form',
        inputSchema: StartFormSchema
    })
    async startForm(input: z.infer<typeof StartFormSchema>, ctx: ExecutionContext) {
        ctx.logger.info(`Starting form: ${input.formId}`);
        try {
            return await this.formsService.startForm(input.formId);
        } catch (error: any) {
            ctx.logger.error(`Error starting form: ${error.message}`);
            throw error;
        }
    }

    @Tool({
        name: 'get_next_question',
        description: 'Get the next unanswered question for an active form session',
        inputSchema: GetNextQuestionSchema
    })
    async getNextQuestion(input: z.infer<typeof GetNextQuestionSchema>, ctx: ExecutionContext) {
        ctx.logger.info(`Getting next question for session: ${input.sessionId}`);
        try {
            return await this.formsService.getNextQuestion(input.sessionId);
        } catch (error: any) {
            ctx.logger.error(`Error getting next question: ${error.message}`);
            throw error;
        }
    }

    @Tool({
        name: 'go_to_previous_question',
        description:
            'Go back to the previously answered question in an active form session. ' +
            'Clears the previous answer so the user can re-answer it, then returns the question details. ' +
            'After re-answering with save_answer, call get_next_question to continue forward. ' +
            'Returns atStart: true if already at the first question.',
        inputSchema: GetPreviousQuestionSchema
    })
    async goToPreviousQuestion(input: z.infer<typeof GetPreviousQuestionSchema>, ctx: ExecutionContext) {
        ctx.logger.info(`Going to previous question for session: ${input.sessionId}`);
        try {
            return await this.formsService.getPreviousQuestion(input.sessionId);
        } catch (error: any) {
            ctx.logger.error(`Error going to previous question: ${error.message}`);
            throw error;
        }
    }

    @Tool({
        name: 'save_answer',
        description: 'Save an answer to a question in an active form session',
        inputSchema: SaveAnswerSchema
    })
    async saveAnswer(input: z.infer<typeof SaveAnswerSchema>, ctx: ExecutionContext) {
        ctx.logger.info(`Saving answer for question: ${input.questionId} in session: ${input.sessionId}`);
        try {
            return await this.formsService.saveAnswer(input.sessionId, input.questionId, input.answer);
        } catch (error: any) {
            ctx.logger.error(`Error saving answer: ${error.message}`);
            throw error;
        }
    }

    @Tool({
        name: 'submit_form',
        description:
            'Submit an active form session if all required fields are complete. On success this generates a ' +
            'summary PDF (title, submission date, and every question/answer) and stores it in MongoDB. The response ' +
            'includes a documentId — call get_form_document with that id to retrieve and display the generated PDF.',
        inputSchema: SubmitFormSchema
    })
    async submitForm(input: z.infer<typeof SubmitFormSchema>, ctx: ExecutionContext) {
        ctx.logger.info(`Submitting form for session: ${input.sessionId}`);
        try {
            return await this.formsService.submitForm(input.sessionId);
        } catch (error: any) {
            ctx.logger.error(`Error submitting form: ${error.message}`);
            throw error;
        }
    }

    @Tool({
        name: 'get_form_document',
        description:
            'Retrieve the generated submission PDF for a form (title, submission date, and question/answer pairs). ' +
            'Use the documentId returned by submit_form. Renders as a document card.',
        inputSchema: GetFormDocumentSchema
    })
    @Widget('document-viewer')
    async getFormDocument(input: z.infer<typeof GetFormDocumentSchema>, ctx: ExecutionContext) {
        ctx.logger.info(`Fetching form document: ${input.documentId}`);
        try {
            return await this.formsService.getFormDocument(input.documentId);
        } catch (error: any) {
            ctx.logger.error(`Error fetching form document: ${error.message}`);
            throw error;
        }
    }
}