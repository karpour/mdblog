import { statSync } from "fs";

export default function isDirectory(path: string) {
    return statSync(path).isDirectory();
}
