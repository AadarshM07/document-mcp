const fs = require('fs');
const { PDFParse } = require('pdf-parse');

(async () => {
    try {
        const buffer = fs.readFileSync('./utils/Vendor Registration Guide.pdf');
        // Let's see if PDFParse.load or similar works
        const parser = new PDFParse();
        await parser.load(buffer);
        const text = await parser.getText();
        console.log("Text length:", text.length);
        console.log("First 100 chars:", text.substring(0, 100));
    } catch(err) {
        console.error(err);
    }
})();
