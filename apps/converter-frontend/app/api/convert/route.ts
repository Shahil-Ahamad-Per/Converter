import { type NextRequest, NextResponse } from "next/server";
import { convertImage, mergeImages } from "@/lib/image-processor";
import { mergePDFs, isPDF, convertToPDF } from "@/lib/pdf-processor";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const conversionType = formData.get("conversionType") as string;
    const optionsStr = formData.get("options") as string;

    // Validation
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!conversionType) {
      return NextResponse.json(
        { error: "Conversion type not specified" },
        { status: 400 }
      );
    }

    // Check file sizes
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 50MB` },
          { status: 400 }
        );
      }
    }

    // Convert files to buffers
    const buffers = await Promise.all(
      files.map((file) => file.arrayBuffer().then((ab) => Buffer.from(ab)))
    );

    let resultBuffer: Buffer;
    const options = optionsStr ? JSON.parse(optionsStr) : {};

    // Handle different conversion types
    if (conversionType === "merge-pdf") {
      resultBuffer = await mergePDFs(buffers);
    } else if (conversionType === "merge-images-vertical") {
      resultBuffer = await mergeImages(
        buffers,
        "vertical",
        options.quality || 80
      );
    } else if (conversionType === "merge-images-horizontal") {
      resultBuffer = await mergeImages(
        buffers,
        "horizontal",
        options.quality || 80
      );
    } else if (["png", "jpg", "jpeg", "webp", "svg"].includes(conversionType)) {
      // Image conversion
      if (files.length !== 1) {
        return NextResponse.json(
          { error: "Image conversion requires a single file" },
          { status: 400 }
        );
      }

      const inputFormat = getFileExtension(files[0].name);
      resultBuffer = await convertImage(
        buffers[0],
        inputFormat,
        conversionType as any,
        options.quality || 80
      );
    } else if (conversionType === "pdf") {
      // PDF conversion - for now, just return error with instructions
      if (files.length !== 1) {
        return NextResponse.json(
          { error: "PDF conversion requires a single file" },
          { status: 400 }
        );
      }

      // Check if input is already PDF
      if (await isPDF(buffers[0])) {
        resultBuffer = buffers[0];
      } else {
        // Try to convert to PDF (supports images now)
        try {
          const inputFormat = getFileExtension(files[0].name);
          resultBuffer = await convertToPDF(buffers[0], inputFormat);
        } catch (e) {
          return NextResponse.json(
            {
              error:
                "Converting to PDF requires external service. Please setup LibreOffice or cloud API.",
            },
            { status: 501 }
          );
        }
      }
    } else if (["docx", "xlsx", "pptx", "txt"].includes(conversionType)) {
      // Document conversion - would need external service
      return NextResponse.json(
        {
          error: `Converting to ${conversionType} requires external service setup (CloudConvert, LibreOffice, etc.)`,
        },
        { status: 501 }
      );
    } else {
      return NextResponse.json(
        { error: "Unsupported conversion type" },
        { status: 400 }
      );
    }

    // Return the converted file
    return new NextResponse(resultBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": getContentType(conversionType),
        "Content-Disposition": `attachment; filename="converted.${getFileExtension(conversionType)}"`,
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      {
        error: `Conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function getContentType(conversionType: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    svg: "image/svg+xml",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
  };
  return mimeTypes[conversionType] || "application/octet-stream";
}
