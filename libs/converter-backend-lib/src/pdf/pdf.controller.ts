import {
  Controller,
  Post,
  UploadedFiles,
  UploadedFile,
  UseInterceptors,
  Res,
} from "@nestjs/common";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { PdfService } from "./pdf.service";
import { Response } from "express";
import { Multer } from "multer";

@Controller("pdf")
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post("merge")
  @UseInterceptors(FilesInterceptor("files"))
  async merge(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res: Response
  ) {
    try {
      if (!files || files.length === 0) {
        return res.status(400).send("No files uploaded");
      }
      const mergedPdf = await this.pdfService.mergePdfs(files);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=merged.pdf",
        "Content-Length": mergedPdf.length,
      });
      res.end(mergedPdf);
    } catch (e) {
      console.error(e);
      res.status(500).send("Error processing files");
    }
  }

  @Post("convert")
  @UseInterceptors(FileInterceptor("file"))
  async convert(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    try {
      const pdf = await this.pdfService.convertToPdf(file);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=converted.pdf",
        "Content-Length": pdf.length,
      });
      res.end(pdf);
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
}
