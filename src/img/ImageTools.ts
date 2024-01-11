import { exec, spawn } from "child_process";
import fs, { existsSync } from "fs";
import im from "imagemagick";
import { Readable } from "stream";
import { promisify } from "util";


export type ImageFeatures = {
    format?: string;
    width?: number;
    height?: number;
    depth?: number;
};


export default class ImageTools {


    static conv(path: string): Readable {
        const fileStream = fs.createReadStream(path);
        //var args = ['-', '-thumbnail', req.params.size + '^', '-gravity', 'center', '-extent', req.params.size, '-'];
        //const args = ['-', '-resize', '64x64', '-grayscale', 'Rec709Luma', '-background', 'white', '-alpha', 'remove', '-remap', 'colormap.bmp', 'gif:-'];
        const args = ['-', '-resize', '64x64', 'gif:-'];
        var convert = spawn('convert', args);

        fileStream.pipe(convert.stdin);
        return convert.stdout;
    }

    static convert2Bit(imagePath: string, width: number, height: number) {
        //convert test.jpg -resize '240x240' -grayscale Rec709Luma -remap colormap.bmp test.gif
        let image = im.convert([imagePath, '-resize', `${width}x${height}`, 'gif:-'], (err, result) => {

        });

    }

    static convertGif(imagePath: string, width: number, height: number) {
    }


    static identify(imagePath: string): Promise<ImageFeatures> {
        return new Promise((resolve, reject) => {
            im.identify(imagePath, function (err, features: im.Features) {
                if (err) {
                    reject(err);
                } else {
                    resolve(features);
                }
            });
        });
    }
}

if (require.main === module) {
    const imagePath = process.argv[2];
    const outPath = process.argv[3];

    if (!existsSync(imagePath)) {
        console.error(`File does not exist: ${imagePath}`);
    }

    ImageTools.conv(imagePath).pipe(fs.createWriteStream(outPath));
}