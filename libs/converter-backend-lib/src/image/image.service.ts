import { Injectable } from "@nestjs/common";
import * as sharp from "sharp";

@Injectable()
export class ImageService {
  async convertImage(
    file: Express.Multer.File,
    format: keyof sharp.FormatEnum
  ): Promise<Buffer> {
    return sharp(file.buffer).toFormat(format).toBuffer();
  }

  async mergeImages(
    files: Express.Multer.File[],
    direction: "vertical" | "horizontal" = "vertical"
  ): Promise<Buffer> {
    const images = await Promise.all(
      files.map(async (file) => ({
        buffer: file.buffer,
        meta: await sharp(file.buffer).metadata(),
      }))
    );

    if (images.length === 0) return Buffer.from([]);

    let totalWidth = 0;
    let totalHeight = 0;

    if (direction === "vertical") {
      totalWidth = Math.max(...images.map((img) => img.meta.width || 0));
      totalHeight = images.reduce(
        (sum, img) => sum + (img.meta.height || 0),
        0
      );
    } else {
      totalWidth = images.reduce((sum, img) => sum + (img.meta.width || 0), 0);
      totalHeight = Math.max(...images.map((img) => img.meta.height || 0));
    }

    const composites = [];
    let currentX = 0;
    let currentY = 0;

    for (const img of images) {
      composites.push({ input: img.buffer, top: currentY, left: currentX });
      if (direction === "vertical") {
        currentY += img.meta.height || 0;
      } else {
        currentX += img.meta.width || 0;
      }
    }

    return sharp({
      create: {
        width: totalWidth,
        height: totalHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(composites)
      .png() // Default to PNG for transparency support
      .toBuffer();
  }
}
