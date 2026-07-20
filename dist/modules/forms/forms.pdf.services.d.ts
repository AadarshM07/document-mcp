export interface PdfQuestionAnswer {
    question: string;
    answer: string;
}
export interface GenerateFormPdfInput {
    title: string;
    date: Date;
    formDescription?: string;
    qa: PdfQuestionAnswer[];
}
export declare class FormsPdfService {
    generateFormPdf(input: GenerateFormPdfInput): Promise<Buffer>;
}
//# sourceMappingURL=forms.pdf.services.d.ts.map