import { spawn } from 'child_process';
import { access, accessSync, constants, createReadStream, createWriteStream } from 'fs';
import { Readable, pipeline } from 'stream';

export async function getImageStream(filePath: string, width: number, height: number, imageFormat: "gif" | "wbmp"): Promise<Readable> {
    console.log(`Reading image from ${filePath}`);

    // Check file accessibility
    try {
        await accessSync(filePath, constants.R_OK);
    } catch (err) {
        throw new Error(`File not found or not readable: ${filePath}`);
    }

    const fileStream = createReadStream(filePath);

    // Define ImageMagick process
    const convert = spawn("convert", [
        "-", // Read input from stdin
        "-resize", `${width}x${height}`, // Resize while maintaining aspect ratio
        `${imageFormat.toUpperCase()}:-` // Output GIF to stdout
    ]);

    // Handle errors in ImageMagick
    convert.stderr.on("data", (data) => {
        console.error("ImageMagick error:", data.toString());
    });

    pipeline(
        fileStream,
        convert.stdin,
        (err) => {
            if (err) {
                console.error("Pipeline error:", err);
                throw new Error("Failed to convert image");
            }
        }
    );

    return convert.stdout;
}

/**
 * Writes a readable image stream to a file.
 * @param inputStream - The image stream returned from getImageStream.
 * @param outputPath - Path where the image should be saved.
 */
export function writeImageToFile(inputStream: Readable, outputPath: string) {
    const writeStream = createWriteStream(outputPath);

    try {
        pipeline(inputStream, writeStream);
        console.log(`Image written to ${outputPath}`);
    } catch (err) {
        console.error(`Failed to write image to file: ${err}`);
        throw err;
    }
}