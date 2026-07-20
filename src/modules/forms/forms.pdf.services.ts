import { Injectable } from '@nitrostack/core';
import PDFDocument from 'pdfkit';

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


@Injectable()
export class FormsPdfService {
    async generateFormPdf(input: GenerateFormPdfInput): Promise<Buffer> {
        const { title, date, formDescription, qa } = input;

        return new Promise<Buffer>((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', (err: Error) => reject(err));

                // Header
                doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
                doc.moveDown(0.3);
                doc
                    .fontSize(10)
                    .font('Helvetica')
                    .fillColor('#666666')
                    .text(
                        date.toLocaleString('en-US', {
                            dateStyle: 'long',
                            timeStyle: 'short'
                        }),
                        { align: 'center' }
                    );

                if (formDescription) {
                    doc.moveDown(0.5);
                    doc.fontSize(10).fillColor('#444444').text(formDescription, { align: 'center' });
                }

                doc.fillColor('#000000');
                doc.moveDown(1);
                doc
                    .strokeColor('#dddddd')
                    .lineWidth(1)
                    .moveTo(doc.page.margins.left, doc.y)
                    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
                    .stroke();
                doc.moveDown(1);

                // Question / Answer pairs
                qa.forEach((item, index) => {
                    if (doc.y > doc.page.height - doc.page.margins.bottom - 80) {
                        doc.addPage();
                    }

                    doc
                        .fontSize(12)
                        .font('Helvetica-Bold')
                        .fillColor('#000000')
                        .text(`${index + 1}. ${item.question}`);

                    doc.moveDown(0.2);
                    doc
                        .fontSize(11)
                        .font('Helvetica')
                        .fillColor('#333333')
                        .text(item.answer && item.answer.length > 0 ? item.answer : '(no answer provided)', {
                            indent: 15
                        });

                    doc.moveDown(1);
                });

                // Footer
                doc
                    .fontSize(8)
                    .fillColor('#999999')
                    .text(`Generated on ${new Date().toLocaleString('en-US')}`, {
                        align: 'center'
                    });

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}