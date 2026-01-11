import { Injectable } from "@nestjs/common";
import { PDFDocument } from "pdf-lib";

@Injectable()
export class PdfService {
  async mergePdfs(files: Express.Multer.File[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const pdf = await PDFDocument.load(file.buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    return Buffer.from(pdfBytes);
  }

  // Placeholder for other conversions as pdf-lib is limited for non-PDF inputs
  // In a real scenario, this would interface with LibreOffice or similar tools
  async convertToPdf(file: Express.Multer.File): Promise<Buffer> {
    // Mock implementation for TXT conversion
    if (file.mimetype === "text/plain") {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const text = file.buffer.toString("utf-8");
      page.drawText(text, { x: 50, y: height - 50, size: 12 });
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    }
    throw new Error(
      "Conversion not supported for this file type in this demo."
    );
  }
}
