import { Module } from '@nitrostack/core';
import { FormsService } from './forms.service.js';
import { FormsTools } from './forms.tools.js';
import { FormsPdfService } from './forms.pdf.services.js';

@Module({
    name: 'forms',
    description: 'Provides AI tools for interactive form filling and data collection.',
    controllers: [FormsTools],
    providers: [FormsService, FormsPdfService]
})
export class FormsModule {}