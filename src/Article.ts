import { existsSync, readFileSync } from "fs";
import path from "path";
import { ArticleProps } from "./ArticleProps";
import ArticleMarkdownRenderer from "./renderers/ArticleMarkdownRenderer";
import assert from "assert";

export type ArticleRenderData = {
    html: string;
    title: string,
    date?: Date,
    slug: string,
    author?: string,
    description: string,
    url: string;
};


export class Article implements ArticleProps {
    public readonly title: string;
    public readonly tags: string[];
    public readonly categories: string[];
    public readonly slug: string;
    public readonly description: string;
    public readonly date: Date;
    public readonly author?: string;
    public readonly relativeUrl: string;
    public readonly lastChanged: Date;
    public readonly markdown: string;

    /**
     * Construct a new Article
     * @param directory Directory of the article files
     * @param basePath basepath of the articles
     */
    public constructor(protected directory: string, basePath: string) {
        // Check if article directory exists
        if (!Article.isArticleDir(directory)) {
            throw new Error(`Directory "${directory}" does not exist`);
        }

        // Find markdown file
        const articleMdFilePath = path.join(directory, "article.md");
        // Read raw markdown from file

        this.markdown = readFileSync(articleMdFilePath).toString("utf8");

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
        this.date = frontmatter.date ? new Date(frontmatter.date) : new Date(0);
        // TODO read from file
        this.lastChanged = this.date;
        this.author = frontmatter.author;
        this.description = frontmatter.description ?? "";
        this.relativeUrl = path.join(basePath, this.slug + '/');
    }

    public getId() {
        return this.slug;
    }

    public getArticleData(renderer: ArticleMarkdownRenderer) {
        return {
            html: renderer.render(this.markdown, { url: this.relativeUrl }),
            title: this.title,
            author: this.author,
            date: this.date,
            slug: this.slug,
            description: this.description,
            tags: this.tags,
            categories: this.categories,
            url: this.relativeUrl
        };
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


    /**
     * Checks if a directory is n article directory
     * @param directory Directory to check
     * @returns true if directory is an article dir
     */
    public static isArticleDir(directory: string) {
        return existsSync(path.join(directory, 'article.md'));
    }
}

