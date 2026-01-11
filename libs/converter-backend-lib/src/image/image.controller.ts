import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Res,
  Query,
  Body,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ImageService } from "./image.service";
import { Response } from "express";
import * as sharp from "sharp";

@Controller("image")
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post("convert")
  @UseInterceptors(FileInterceptor("file"))
  async convert(
    @UploadedFile() file: Express.Multer.File,
    @Query("format") format: string,
    @Res() res: Response
  ) {
    try {
      if (!file) {
        return res.status(400).send("No file uploaded");
      }
      const validFormats = [
        "png",
        "jpeg",
        "jpg",
        "webp",
        "tiff",
        "avif",
        "svg",
      ]; // svg output from sharp is restricted usually but input is fine. Sharp output to svg is not standard raster->vector.
      // For this demo, let's assume raster formats.
      if (!validFormats.includes(format)) {
        return res.status(400).send("Invalid format");
      }

      const buffer = await this.imageService.convertImage(
        file,
        format as keyof sharp.FormatEnum
      );
      res.set({
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename=converted.${format}`,
        "Content-Length": buffer.length,
      });
      res.end(buffer);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }

  @Post("merge")
  @UseInterceptors(FilesInterceptor("files"))
  async merge(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Query("direction") direction: "vertical" | "horizontal",
    @Res() res: Response
  ) {
    try {
      if (!files || files.length === 0) {
        return res.status(400).send("No files uploaded");
      }
      const mergedImage = await this.imageService.mergeImages(files, direction);
      res.set({
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=merged.png",
        "Content-Length": mergedImage.length,
      });
      res.end(mergedImage);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
}
