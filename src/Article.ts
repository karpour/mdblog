import { readFileSync } from "fs";
import path from "path";
import { isArticleDir, createSlug } from "./MdBlog";


export interface ArticleProps {
    title: string;
    tags: string[];
    categories: string[];
    slug?: string;
    date: Date;
    author?: string;
}

export class Article implements ArticleProps {
    public title: string;
    public tags: string[];
    public categories: string[];
    public slug: string;
    public date: Date;
    public author?: string;


    markdown: string;

    public constructor(directory: string) {
        if (!isArticleDir(directory))
            throw new Error(`Directory "${directory}" does not exist`);
        this.markdown = readFileSync(path.join(directory, "article.md")).toString("utf8");

        //console.log(markdown)
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

        const RegExp_FrontMatter = /^(\w+):\s*(.+?)\s*$/;

        //console.log(lines)
        let input: any = {};
        lines.forEach(line => {
            let kv = RegExp_FrontMatter.exec(line);
            //console.log(kv);
            if (kv) {
                input[kv[1]] = kv[2];
            }
        });

        this.title = input.title ?? "undefined";
        this.tags = (input.tags ?? "").split(/\s*,\s*/);
        this.categories = input.categories ?? [];
        this.slug = input.slug ?? createSlug(this.title);
        this.date = new Date(input.date);
        this.author = input.author;
    }

    public getId() {
        return this.slug;
    }
}
