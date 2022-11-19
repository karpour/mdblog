import { existsSync, readdirSync, statSync } from "fs";
import path from "path";
import RSS from "rss";
import { Article } from "./Article";
import express, { Application } from 'express';


import GopherMarkdownRenderer, { text } from "./markdown/GopherMarkdownRenderer";
import ArticleMarkdownRenderer from "./markdown/ArticleMarkdownRenderer";
import Html5MarkdownRenderer from "./markdown/Html5MarkdownRenderer";
const { GopherServer, DynamicRouter, URLRouter } = require("gopher-server");



export type MdBlogConfig = {
    siteTitle: string,
    hostname: string,
    rootDir: string,
    httpPort?: number,
    gopherPort?: number;
    author: string,
    path?: string;
};

/**
 * Checks if a directory is n article directory
 * @param directory Directory to check
 * @returns true if directory is an article dir
 */
export function isArticleDir(directory: string) {
    return existsSync(path.join(directory, 'article.md'));
}

export function createSlug(title: string) {
    return title.toLowerCase().replace(/[^A-Za-z0-9]+/g, "-");
}

export function validateMdBlogConfig(config: any): MdBlogConfig {
    // TODO
    return config as MdBlogConfig;
}


const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_GOPHER_PORT = 8070;

export type MdBlogRenderers = {
    //html4Renderer: ArticleMarkdownRenderer;
    html5Renderer: Html5MarkdownRenderer;
    rssRenderer: ArticleMarkdownRenderer;
    gopherRenderer: GopherMarkdownRenderer;
    [key: string]: ArticleMarkdownRenderer;
};

class MdBlog {
    protected readonly siteTitle: string;
    protected readonly hostname: string;
    protected readonly path: string;
    protected readonly rootDir: string;
    protected readonly httpPort: number;
    protected readonly gopherPort: number;

    protected renderers: MdBlogRenderers;


    protected app: Application;
    protected gopher: typeof GopherServer;

    protected articlesById: { [key: string]: Article; } = {};
    protected articles: Article[] = [];

    public constructor(protected config: MdBlogConfig) {
        console.log(`Started MdBlog "${config.siteTitle}"`);
        console.log(`hostname: "${config.hostname}"`);
        this.siteTitle = config.siteTitle;
        this.hostname = config.hostname;
        this.rootDir = config.rootDir;
        this.httpPort = config.httpPort ?? DEFAULT_HTTP_PORT;
        this.gopherPort = config.gopherPort ?? DEFAULT_GOPHER_PORT;
        this.path = config.path ?? "/";
        this.app = express();

        this.renderers = {
            html5Renderer: new Html5MarkdownRenderer(this.hostname),
            rssRenderer: new Html5MarkdownRenderer(this.hostname),
            gopherRenderer: new GopherMarkdownRenderer(this.hostname)
        };

        const self = this;

        this.app.get('/ua', function (req, res) {
            res.end(req.headers["user-agent"]);
        });

        this.app.get('/feed', function (req, res) {
            res.end(self.getRSS());
        });

        this.app.get('/:articleId', function (req, res) {
            res.end(self.getRSS());
        });



        this.gopher = new GopherServer();

        this.gopher.use(
            new DynamicRouter("/", (request: any, params: any) => {
                request.send(`iWelcome`);
            })
        );

        this.gopher.use(
            new DynamicRouter("/:id", (request: any, params: any) => {
                const articleId = params.id.replaceAll("_", "-")
                console.log(`Request for ${articleId}`);
                const article = self.getArticle(articleId);
                if (article) {
                    request.send(self.renderers.gopherRenderer.render(article.markdown));
                } else {
                    request.send(`iPage "${articleId}" not found`);
                }
            })
        );

        // Log all requests to the server
        this.gopher.on("request", (request: any) => {
            console.log(`${request.socket.remoteAddress} requested ${request.path}`);
        });



        this.reScan();



        this.app.listen(this.config.httpPort);
        this.gopher.listen(this.config.gopherPort);
    }

    public getRSS(category?: string): string {
        const rss = new RSS({
            title: this.siteTitle,
            feed_url: `http://${this.hostname}/feed/`,
            site_url: `http://${this.hostname}`,
            image_url: "",
            language: "English",
        });
        this.getArticles().forEach(article => rss.item({
            date: article.date,
            description: this.renderers.rssRenderer.render(article.markdown),
            title: article.title,
            url: this.getHttpUrl(article),
            author: article.author ?? this.config.author,
            categories: article.tags,
        }));
        return rss.xml();
    }

    public getHttpUrl(article: Article) {
        return path.join(this.hostname, this.path, article.slug);
    }

    public getArticles(amount?: number, page: number = 1, filter?: (a: Article) => boolean): Article[] {
        let result = this.articles;
        if (filter) result = result.filter(filter);
        let p = page ?? 1;
        //validatePositiveInteger(page)
        if (amount !== undefined) {
            p -= 1;
            result = result.slice(amount * page, amount * page + amount);
        }
        return result;
    }

    public getArticle(articleId: string): Article | undefined {
        return this.articlesById[articleId];
    }

    private scanDir(dir: string): Article[] {
        if (isArticleDir(dir)) {
            return [new Article(dir)];
        }
        return readdirSync(dir)
            .map(d => path.join(dir, d))
            .filter(d => statSync(d).isDirectory())
            .map(d => this.scanDir(d))
            .flat();
    }

    public reScan() {
        this.articles = this.scanDir(this.rootDir).sort((a: Article, b: Article) => b.date.getTime() - a.date.getTime());
        this.articles.forEach(a => { this.articlesById[a.getId()] = a; });
        console.log(this.articlesById);
    }
}

export default MdBlog;