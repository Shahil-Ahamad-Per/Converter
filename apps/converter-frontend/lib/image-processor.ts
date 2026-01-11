import sharp from "sharp"

export type ImageFormat = "png" | "jpg" | "jpeg" | "webp" | "svg"

export async function convertImage(
  buffer: Buffer,
  inputFormat: string,
  outputFormat: ImageFormat,
  quality = 80,
): Promise<Buffer> {
  try {
    let pipeline = sharp(buffer)

    // Convert based on output format
    switch (outputFormat) {
      case "png":
        pipeline = pipeline.png({ compressionLevel: 9 })
        break
      case "jpg":
      case "jpeg":
        pipeline = pipeline.jpeg({ quality, progressive: true })
        break
      case "webp":
        pipeline = pipeline.webp({ quality })
        break
      case "svg":
        // SVG conversion is complex and requires tracing
        // For now, we'll convert to PNG as an intermediate format
        // In production, use a library like potrace for better results
        pipeline = pipeline.png()
        break
      default:
        pipeline = pipeline.toFormat(outputFormat as any, { quality })
    }

    return await pipeline.toBuffer()
  } catch (error) {
    throw new Error(`Failed to convert image: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function mergeImages(
  buffers: Buffer[],
  direction: "vertical" | "horizontal" = "vertical",
  quality = 80,
): Promise<Buffer> {
  if (buffers.length === 0) {
    throw new Error("No images provided for merging")
  }

  if (buffers.length === 1) {
    return buffers[0]
  }

  try {
    const images = await Promise.all(buffers.map((buf) => sharp(buf).metadata()))

    // Calculate dimensions for merged image
    let totalWidth = 0
    let totalHeight = 0
    const maxHeight = Math.max(...images.map((img) => img.height || 0))
    const maxWidth = Math.max(...images.map((img) => img.width || 0))

    if (direction === "horizontal") {
      totalWidth = images.reduce((sum, img) => sum + (img.width || 0), 0)
      totalHeight = maxHeight || 0
    } else {
      totalWidth = maxWidth || 0
      totalHeight = images.reduce((sum, img) => sum + (img.height || 0), 0)
    }

    if (totalWidth <= 0 || totalHeight <= 0) {
      throw new Error("Invalid image dimensions")
    }

    // Create a composite image
    const canvas = sharp({
      create: {
        width: totalWidth,
        height: totalHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })

    let offset = 0
    const composites = await Promise.all(
      buffers.map(async (buf) => {
        const { width = 0, height = 0 } = await sharp(buf).metadata()

        const compositeInfo: any = {
          input: buf,
        }

        if (direction === "horizontal") {
          compositeInfo.left = offset
          compositeInfo.top = 0
          offset += width
        } else {
          compositeInfo.left = 0
          compositeInfo.top = offset
          offset += height
        }

        return compositeInfo
      }),
    )

    return await canvas.composite(composites).jpeg({ quality, progressive: true }).toBuffer()
  } catch (error) {
    throw new Error(`Failed to merge images: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getImageFormat(buffer: Buffer): Promise<ImageFormat | null> {
  try {
    const metadata = await sharp(buffer).metadata()
    const format = metadata.format?.toLowerCase()

    if (format === "jpeg") return "jpg"
    if (["png", "webp"].includes(format || "")) return format as ImageFormat
    if (format === "svg") return "svg"

    return null
  } catch {
    return null
  }
}
