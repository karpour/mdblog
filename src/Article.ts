import { existsSync, readFileSync } from "fs";
import { readdir, stat } from "fs/promises";
import path from "path";
import { ArticleProps } from "./ArticleProps";
import { isArticleDir } from "./isArticleDir";
import { createSlug } from "./MdBlog";


export class Article implements ArticleProps {
    public title: string;
    public tags: string[];
    public categories: string[];
    public slug: string;
    public date: Date;
    public author?: string;
    public relativeUrl: string;


    markdown: string;

    public constructor(protected directory: string, basePath: string) {
        if (!isArticleDir(directory))
            throw new Error(`Directory "${directory}" does not exist`);
        this.markdown = readFileSync(path.join(directory, "article.md")).toString("utf8");

        let regExpResult = /---\n(?<frontmatter>(?:.*\n)+?)---\n+/.exec(this.markdown);
        const frontmatterRaw = regExpResult?.groups?.['frontmatter'] ?? '';
        const frontmatterLines = frontmatterRaw.split(/\r?\n/) ?? [];
        if (regExpResult) {
            this.markdown = this.markdown.slice(regExpResult[0].length, this.markdown.length);
        }
        //console.log(frontmatterLines);

        const RegExp_FrontMatter = /^(\w+):\s*(.+?)\s*$/;
        let frontmatter: any = {};

        for (let line of frontmatterLines) {
            let kv = RegExp_FrontMatter.exec(line);
            //console.log(kv);
            if (kv) {
                frontmatter[kv[1]] = kv[2];
            }
        }

        //console.log(frontmatter);

        //console.log(this.markdown);

        /*//console.log(markdown)
        let lines = this.markdown.split(/\r?\n/);
        let lineIdx = 0;
 
        let hasNext = () => lines[lineIdx] != undefined;
        let getNext = function (): string | undefined { return lines[lineIdx++]; };
        let next = function (): string { return lines[lineIdx]; };
 
        //console.log(lines);
        // Get Header
        let header: string[] = [];
        if (getNext() == "---") {
            while (next() != "---")
                header.push(getNext() as string);
            getNext();
        }
 
 
        //console.log(lines)
        lines.forEach(line => {
            let kv = RegExp_FrontMatter.exec(line);
            //console.log(kv);
            if (kv) {
                input[kv[1]] = kv[2];
            }
        });*/

        this.tags = frontmatter.tags ? frontmatter.tags.split(/\s*,\s*/) : [];
        this.categories = frontmatter.categories ? frontmatter.categories.split(/\s*,\s*/) : [];
        this.slug = path.basename(this.directory);
        this.title = frontmatter.title ?? this.slug;
        this.date = new Date(frontmatter.date);
        this.author = frontmatter.author;
        this.relativeUrl = path.join(basePath, this.slug + '/');
    }

    public getId() {
        return this.slug;
    }


    /*public static async getArticles(dir: string, outArray: Article[] = [], recursive: boolean = true): Promise<Article[]> {
        if (this.isArticleDir(dir)) {
            outArray.push(new Article(dir));
        } else {
            let files = await readdir(dir);
            for (var f of files) {
                // Ignore dirs like .git, .templates
                if (f.startsWith('.')) continue;
                var curDir = path.join(dir, f);
                if ((await stat(curDir)).isDirectory()) {
                    await this.getArticles(curDir, outArray);
                }
            }
        }
        return outArray;
    }*/

    public async create() {

    }

    public static isArticleDir(directory: string) {
        return existsSync(path.join(directory, 'report.md'));
    }
}