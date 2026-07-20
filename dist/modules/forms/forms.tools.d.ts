import { ExecutionContext, z } from '@nitrostack/core';
import { FormsService } from './forms.service.js';
declare const ListFormsSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit: number;
}, {
    query: string;
    limit?: number | undefined;
}>;
declare const StartFormSchema: z.ZodObject<{
    formId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    formId: string;
}, {
    formId: string;
}>;
declare const GetNextQuestionSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
declare const SaveAnswerSchema: z.ZodObject<{
    sessionId: z.ZodString;
    questionId: z.ZodString;
    answer: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    questionId: string;
    sessionId: string;
    answer?: any;
}, {
    questionId: string;
    sessionId: string;
    answer?: any;
}>;
declare const SubmitFormSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
declare const GetFormDocumentSchema: z.ZodObject<{
    documentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    documentId: string;
}, {
    documentId: string;
}>;
export declare class FormsTools {
    private readonly formsService;
    constructor(formsService: FormsService);
    listForms(input: z.infer<typeof ListFormsSchema>, ctx: ExecutionContext): Promise<{
        results: {
            id: string;
            name: any;
            description: any;
            category: any;
            questionCount: number;
        }[];
    }>;
    startForm(input: z.infer<typeof StartFormSchema>, ctx: ExecutionContext): Promise<{
        sessionId: string;
        formName: any;
        description: any;
        message: string;
    }>;
    getNextQuestion(input: z.infer<typeof GetNextQuestionSchema>, ctx: ExecutionContext): Promise<{
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
    saveAnswer(input: z.infer<typeof SaveAnswerSchema>, ctx: ExecutionContext): Promise<{
        success: boolean;
        message: string;
    }>;
    submitForm(input: z.infer<typeof SubmitFormSchema>, ctx: ExecutionContext): Promise<{
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
    getFormDocument(input: z.infer<typeof GetFormDocumentSchema>, ctx: ExecutionContext): Promise<{
        metadata: {
            id: string;
            filename: any;
            length: any;
            uploadDate: any;
        };
        dataBase64: string;
    }>;
}
export {};
//# sourceMappingURL=forms.tools.d.ts.map