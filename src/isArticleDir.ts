import { existsSync } from "fs";
import path from "path";

/**
 * Checks if a directory is n article directory
 * @param directory Directory to check
 * @returns true if directory is an article dir
 */


export function isArticleDir(directory: string) {
    return existsSync(path.join(directory, 'article.md'));
}
