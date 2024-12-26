import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { Readable, pipeline } from "stream";
import { promisify } from "util";

const streamPipeline = promisify(pipeline);

/**
 * Helper function to convert Web ReadableStream to Node.js Readable stream
 */
function webStreamToNodeStream(
  webStream: ReadableStream<Uint8Array>
): Readable {
  const reader = webStream.getReader();
  const nodeStream = new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
          return;
        }
        this.push(Buffer.from(value));
      } catch (error) {
        this.destroy(error);
      }
    },
    destroy(error, callback) {
      reader
        .cancel()
        .then(() => callback(error))
        .catch(callback);
    },
  });

  nodeStream.on("error", (error) => {
    console.error("Node stream: Stream error:", error);
  });

  nodeStream.on("close", () => {
    console.log("Node stream: Stream closed.");
    reader.cancel().catch((err) => {
      console.error("Error cancelling reader:", err);
    });
  });

  return nodeStream;
}
console.log({
  projectId: process.env.GOOGLE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_PRIVATE_KEY ? "[REDACTED]" : "MISSING",
  bucketName: process.env.GCS_BUCKET_NAME,
});
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      console.warn("No files found in the upload request.");
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedFiles = [];

    // Initialize Google Cloud Storage client
    const storage = new Storage({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });

    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!bucketName) {
      console.error("GCS_BUCKET_NAME is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const bucket = storage.bucket(bucketName);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (file.type !== "application/pdf") {
        console.warn(
          `Invalid file type: ${file.type}. Only PDF files are allowed.`
        );
        return NextResponse.json(
          { error: "Only PDF files are allowed" },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File size exceeds limit: ${file.size} bytes.`);
        return NextResponse.json(
          { error: `File ${file.name} exceeds the 10MB limit` },
          { status: 400 }
        );
      }

      try {
        console.log(`Starting upload for: ${file.name}`);

        // Generate a unique filename
        const timestamp = Date.now();
        const uniqueName = `${timestamp}-${file.name}`;

        // Create a file object in the bucket
        const blob = bucket.file(uniqueName);

        // Convert Web ReadableStream to Node.js Readable stream
        const nodeStream = webStreamToNodeStream(file.stream());

        // Use stream.pipeline for better error handling
        await streamPipeline(
          nodeStream,
          blob.createWriteStream({
            resumable: false,
            contentType: file.type,
            metadata: {
              cacheControl: "no-cache",
            },
          })
        );

        console.log(`Successfully uploaded: ${file.name}`);

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
        });
      } catch (uploadError: any) {
        console.error(`Failed to upload ${file.name}:`, uploadError);
        return NextResponse.json(
          {
            error: `Failed to upload ${file.name}`,
            details: uploadError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Files uploaded successfully", files: uploadedFiles },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
