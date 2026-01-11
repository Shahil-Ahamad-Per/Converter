import { PDFDocument } from "pdf-lib";

export async function mergePDFs(buffers: Buffer[]): Promise<Buffer> {
  if (buffers.length === 0) {
    throw new Error("No PDF files provided for merging");
  }

  if (buffers.length === 1) {
    return buffers[0];
  }

  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Add pages from each PDF
    for (const buffer of buffers) {
      try {
        const pdf = await PDFDocument.load(buffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      } catch (error) {
        throw new Error(
          `Failed to load PDF: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Convert to bytes
    const mergedBytes = await mergedPdf.save();
    return Buffer.from(mergedBytes);
  } catch (error) {
    throw new Error(
      `Failed to merge PDFs: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function isPDF(buffer: Buffer): Promise<boolean> {
  // Check for PDF magic number: %PDF
  const header = buffer.toString("utf8", 0, 4);
  return header === "%PDF";
}

export async function convertToPDF(
  buffer: Buffer,
  inputFormat: string
): Promise<Buffer> {
  // Check if it's an image format we can handle
  if (["png", "jpg", "jpeg"].includes(inputFormat.toLowerCase())) {
    return convertImageToPDF(buffer, inputFormat);
  }

  // This is a simplified example - in production use a proper conversion service
  if (inputFormat === "pdf") {
    return buffer;
  }

  throw new Error(
    `Converting ${inputFormat} to PDF requires external service (LibreOffice, CloudConvert, etc.). Please configure in API route.`
  );
}

export async function convertImageToPDF(
  imageBuffer: Buffer,
  imageFormat: string
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let image;

  try {
    if (imageFormat.toLowerCase() === "png") {
      image = await pdfDoc.embedPng(imageBuffer);
    } else if (["jpg", "jpeg"].includes(imageFormat.toLowerCase())) {
      image = await pdfDoc.embedJpg(imageBuffer);
    } else {
      throw new Error(
        `Unsupported image format for PDF conversion: ${imageFormat}`
      );
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (e) {
    console.error("Error converting image to PDF:", e);
    throw new Error(
      `Failed to convert image to PDF: ${e instanceof Error ? e.message : "Unknown error"}`
    );
  }
}

export async function convertFromPDF(
  buffer: Buffer,
  outputFormat: string
): Promise<Buffer> {
  if (!isPDF(buffer)) {
    throw new Error("Input buffer is not a valid PDF");
  }

  // For converting PDF to other formats, we would use:
  // 1. pdf-parse for text extraction
  // 2. pdf2pic or pdfium for image conversion
  // 3. Cloud APIs for document conversion

  throw new Error(
    `Converting PDF to ${outputFormat} requires external service or library. Please configure in API route.`
  );
}
