import { accessSync, lstatSync, readFileSync } from "fs";
import fs from "fs";
import MdBlog, { MdBlogConfig, validateMdBlogConfig } from "./MdBlog";
import path from "path";

async function main() {
    try {
        const MDBLOG_DIR = process.argv[2] ?? "~/.mdblog/";
        if (!lstatSync(MDBLOG_DIR).isDirectory()) {
            throw new Error(`Not a directory: ${MDBLOG_DIR}`);
        }
        accessSync(MDBLOG_DIR, fs.constants.R_OK);

        const siteConfig = validateMdBlogConfig(JSON.parse(readFileSync(path.join(MDBLOG_DIR, "env.json")).toString()));

        const mdBlog = new MdBlog(siteConfig);
        //console.log(mdBlog.getArticles());
        //mdBlog.reScan();

        console.log(mdBlog.getArticle("sony-pcg-c1xs"));

    } catch (e: any) {
        console.error("Error: " + e.message);
        console.error(e);
        process.exit(1);
    }
}


main();