import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";
import RSS from "rss";
import { Article } from "./Article";
import express, { Application } from 'express';
import ejs, { TemplateFunction } from "ejs";

import GopherMarkdownRenderer, { text } from "./markdown/GopherMarkdownRenderer";
import ArticleMarkdownRenderer from "./markdown/ArticleMarkdownRenderer";
import Html5MarkdownRenderer from "./markdown/Html5MarkdownRenderer";
import { MdBlogConfig } from "./MdBlogConfig";
import log, { verbose } from "./log";
import { CONFIG_FILE_NAME, DIR_STATIC_NAME, DIR_TEMPLATES_NAME } from "./defaults";
const { GopherServer, DynamicRouter, URLRouter } = require("gopher-server");

const defaultConfig: Partial<MdBlogConfig> = {
    httpPort: 80,
    gopherPort: 70
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
    protected config: MdBlogConfig;
    protected readonly siteTitle: string;
    protected readonly hostname: string;
    protected readonly path: string;
    protected readonly rootDir: string;
    protected readonly homeTemplate: TemplateFunction;

    protected renderers: MdBlogRenderers;


    protected app: Application;
    protected gopher: typeof GopherServer;

    protected articlesById: { [key: string]: Article; } = {};
    protected articles: Article[] = [];

    private getFileContents(filePath: string) {
        return readFileSync(path.join(this.rootDir, filePath)).toString();
    }

    public constructor(config: MdBlogConfig) {
        this.config = Object.assign({}, defaultConfig, config);
        console.log(`Started MdBlog "${config.siteTitle}"`);
        console.log(`hostname: "${config.hostname}"`);
        this.siteTitle = this.config.siteTitle;
        this.hostname = this.config.hostname;
        this.rootDir = this.config.rootDir;
        this.path = this.config.path ?? "/";
        this.app = express();

        this.renderers = {
            html5Renderer: new Html5MarkdownRenderer(this.hostname),
            rssRenderer: new Html5MarkdownRenderer(this.hostname),
            gopherRenderer: new GopherMarkdownRenderer(this.hostname)
        };
        this.homeTemplate = ejs.compile(this.getFileContents(".templates/home.ejs"), { context: self });
        this.reScan();
    }

    public serve() {
        this.serveHttp();
        this.serveGopher();
    }

    public serveHttp() {
        const self = this;

        this.app.get('/ua', function (req, res) {
            res.end(req.headers["user-agent"]);
        });

        this.app.get('/feed', function (req, res) {
            res.end(self.getRSS());
        });

        this.app.get('/', function (req, res) {
            res.end(self.homeTemplate());
        });

        this.app.listen(this.config.httpPort);
        console.log(`HTTP listening on ${this.config.httpPort}`);
    }

    public serveGopher() {
        const self = this;

        this.gopher = new GopherServer();

        this.gopher.use(
            new DynamicRouter("/", (request: any, params: any) => {
                request.send(`iWelcome`);
            })
        );

        this.gopher.use(
            new DynamicRouter("/:id", (request: any, params: any) => {
                const articleId = params.id.replaceAll("_", "-");
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
            log.info(`Gopher: ${request.socket.remoteAddress} requested ${request.path}`);
        });
        this.gopher.listen(this.config.gopherPort);
        log.info(`Gopher listening on ${this.config.gopherPort}`);
    }

    public initActivityPub() {

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
        //console.log(this.articlesById);
    }

    public static createBlog(config: MdBlogConfig) {
        verbose(`Creating blog "${config.siteTitle}"`);
        console.log(config);
        if (!existsSync(config.rootDir)) {
            mkdirSync(config.rootDir, { recursive: true });
            mkdirSync(path.join(config.rootDir, DIR_STATIC_NAME), { recursive: true });
            mkdirSync(path.join(config.rootDir, DIR_TEMPLATES_NAME), { recursive: true });
        }
        writeFileSync(path.join(config.rootDir, CONFIG_FILE_NAME), JSON.stringify(config, null, 2));
    }
}

export default MdBlog;