import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        const filePath = `file://${path.join(__dirname, 'documentacion.html').replace(/\\/g, '/')}`;
        await page.goto(filePath, { waitUntil: 'networkidle0' });

        await page.pdf({
            path: 'documentacion.pdf',
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();
        console.log('PDF generado exitosamente en documentacion.pdf');
    } catch (error) {
        console.error('Error generando PDF:', error);
    }
})();
