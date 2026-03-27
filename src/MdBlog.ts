import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import RSS from "rss";
import { Article, ArticleRenderData } from "./Article";
import express, { Application, Response } from 'express';
import { Builder } from "xml2js";
import pretty from "pretty";
import ArticleMarkdownRenderer from "./renderers/ArticleMarkdownRenderer";
import { MdBlogConfig } from "./MdBlogConfig";
import log, { setVerbose, verbose } from "./log";
import { CONFIG_FILE_NAME, DIR_STATIC_NAME, DIR_TEMPLATES_NAME } from "./defaults";
import ArticleProvider from "./ArticleProvider";
import { hostname } from "os";
import { getRenderers, RENDERER_TYPES, RendererType } from "./renderers";
import { getTemplates, TemplateSet, TemplateSets } from "./TemplateManager";
const { GopherServer, DynamicRouter } = require("gopher-server");

const defaultConfig: Partial<MdBlogConfig> = {
    httpPort: 80,
    gopherPort: 70
};

type SiteModes = {
    [key: string]:
    {
        template: string,
        renderer: RendererType;
    };
};

function validateSiteModes(modes: unknown, templates: string[]): asserts modes is SiteModes {
    if (typeof (modes) !== "object" || !modes) {
        throw new Error(`sitemode object is not valid`);
    }
    for (let entry of Object.entries(modes)) {
        const [modeName, mode] = entry;
        if (typeof (mode.renderer) !== "string" || !RENDERER_TYPES.includes(mode.renderer)) {
            throw new Error(`Invalid renderer value for mode ${modeName} renderer: "${mode.renderer}"`);
        }
        if (typeof (mode.template) !== "string" || !templates.includes(mode.template)) {
            throw new Error(`Invalid template value for mode ${modeName} template: "${mode.renderer}" (Available templates: ${templates.join(", ")})`);
        }
    }
}

const modes: SiteModes = {
    "html5": {
        renderer: "html5",
        template: "html5"
    },
    "html4": {
        renderer: "html4",
        template: "html4"
    },
    "text": {
        renderer: "html5",
        template: "text"
    },
    "ppc": {
        renderer: "html4",
        template: "ppc"
    }
};

const CATEGORIES = [
    {
        id: "retro",
        name: "Retro",
        url: "blog/retro"
    },
    {
        id: "art",
        name: "Art",
        url: "blog/art",
    },
    {
        id: "dev",
        name: "Dev",
        url: "blog/dev",
    },
    {
        id: "sports",
        name: "Sports",
        url: "blog/sports",
    },
    {
        id: "gallery",
        name: "Gallery",
        url: "gallery",
    },
    {
        id: "projects",
        name: "Projects",
        url: "projects",
    },
];


export function createSlug(title: string) {
    // TODO sanitize
    return title.toLowerCase().replace(/[^A-Za-z0-9]+/g, "-");
}

export function validateMdBlogConfig(config: any): MdBlogConfig {
    // TODO
    return config as MdBlogConfig;
}

export type MdBlogRenderers = {
    [key: string]: ArticleMarkdownRenderer;
};

const xmlBuilder = new Builder({ headless: true });



//function getTemplateSet(directory: string): TemplateSet {
//    
//}

interface MdBlogLocals {
    renderer: ArticleMarkdownRenderer;
    templates: TemplateSet;
}

type MdFrontPageData = {
    title: string,
    categories: any,
    keywords: string[],
    description: string,
    articles: ArticleRenderData[],
    author: string,
    hostname: string,
    url: string,
    lang: string,
    fediverseCreator: string | null,
    sitename: string,
};

type MdSinglePageData = {
    title: string,
    categories: any,
    keywords: string[],
    description: string,
    author: string,
    hostname: string,
    url: string,
    lang: string,
    fediverseCreator: string | null,
    sitename: string,
    article: ArticleRenderData;
};

setVerbose(true);

class MdBlog {
    protected config: MdBlogConfig;
    protected readonly siteTitle: string;
    protected readonly hostname: string;
    protected readonly path: string;
    protected readonly rootDir: string;
    protected readonly author: string;
    protected readonly description: string;
    protected readonly articleProvider: ArticleProvider;
    protected readonly templates: TemplateSets;
    protected readonly modes: SiteModes;

    protected readonly renderers: MdBlogRenderers;

    protected app: Application;
    protected gopher: typeof GopherServer;

    public constructor(config: MdBlogConfig, articleProvider: ArticleProvider) {
        this.config = Object.assign({}, defaultConfig, config);
        log.info(`Started MdBlog "${config.siteTitle}"`);
        log.info(`Hostname: "${config.hostname}"`);
        this.siteTitle = this.config.siteTitle;
        this.hostname = this.config.hostname;
        this.rootDir = this.config.rootDir;
        this.description = this.config.description ?? "";
        this.author = this.config.author ?? "Unknown";
        this.config.keywords ??= [];
        this.path = this.config.path ?? "/";
        this.app = express();
        this.articleProvider = articleProvider;
        this.modes = modes;

        this.renderers = getRenderers(this.hostname);
        this.templates = getTemplates(path.join(this.rootDir, '.templates'));
    }

    public serve() {
        this.serveHttp();
        this.serveGopher();
    }

    public serveHttp() {
        const self = this;

        // set the view engine to ejs
        this.app.set('view engine', 'ejs');


        // Middleware function to determine render engine
        this.app.get('*', (req, res: Response<any, MdBlogLocals>, next) => {
            const modeId = typeof (req.query.mode) == "string" ? req.query.mode : 'html5';
            let mode = modes[modeId] ?? modes['html5'];
            res.locals.renderer = self.renderers[mode.renderer] ?? self.renderers['html5'];
            res.locals.templates = self.templates[mode.template] ?? self.templates['html5'];
            next();
        });


        this.app.get('/ua', (req, res: Response<any, MdBlogLocals>) => {
            res.end(req.headers["user-agent"]);
        });

        // RSS
        this.app.get('/feed/:category', (req, res: Response<any, MdBlogLocals>) => {
            const categories = req.params.category.split("+");
            console.log(categories);
            res.contentType('application/xml');
            res.end(self.getRSS());
        });

        this.app.get('/feed', (req, res: Response<any, MdBlogLocals>) => {
            res.contentType('application/xml');
            res.end(self.getRSS());
        });

        // Home
        this.app.get('/', (req, res: Response<any, MdBlogLocals>) => {
            console.log("Getting /");
            const articleData = self.getArticles()
                .map(article => article.getArticleData(res.locals.renderer));
            //console.log(articleData);

            const data: MdFrontPageData = {
                title: self.siteTitle,
                categories: CATEGORIES,
                keywords: self.config.keywords,
                description: self.description,
                articles: articleData,
                author: self.author,
                hostname: self.hostname,
                url: "https://" + hostname,
                lang: "en",
                fediverseCreator: self.config.fediverseCreator,
                sitename: self.config.siteTitle,
            };

            console.log(data.title);
            res.header("Content-Type", "text/html");
            res.end(pretty(res.locals.templates.home(data), { ocd: true }));
        });

        this.app.get('/archive/:year', (req, res: Response<any, MdBlogLocals>) => {
            res.end("archive");
        });

        // https://www.sitemaps.org/protocol.html
        this.app.get('/sitemap.xml', (req, res: Response<any, MdBlogLocals>) => {
            res.contentType('application/xml');
            res.end(this.createSitemapXml());
        });

        this.app.get('/:page/', (req, res: Response<any, MdBlogLocals>, next) => {
            const article = self.getArticle(req.params.page);
            if (!article) {
                return next();
            }
            const articleData = article.getArticleData(res.locals.renderer);
            const data: MdSinglePageData = {
                title: `${article.title} - ${self.siteTitle}`,
                categories: CATEGORIES,
                keywords: [...article.tags, ...self.config.keywords],
                description: article.description,
                article: articleData,
                lang: "en",
                hostname: self.hostname,
                author: article.author ?? self.author,
                fediverseCreator: self.config.fediverseCreator,
                url: self.getHttpUrl(article),
                sitename: self.config.siteTitle,
            };
            res.end(res.locals.templates.single(data));
        });

        log.debug(`Serving static files from "${path.join(this.articleProvider.articleDirectory, ".static")}"`);
        this.app.use(express.static(path.join(this.articleProvider.articleDirectory, ".static")));

        this.app.get('*', (req, res: Response<any, MdBlogLocals>) => {
            res.status(404).send('404');
        });

        this.app.listen(this.config.httpPort);
        log.info(`HTTP listening on ${this.config.httpPort}`);
    }

    public serveGopher() {
        const self = this;

        this.gopher = new GopherServer();

        this.gopher.use(
            new DynamicRouter("/", (request: any) => {
                request.send(`iWelcome`);
            })
        );

        this.gopher.use(
            new DynamicRouter("/:id", (request: any, params: any) => {
                const articleId = params.id.replaceAll("_", "-");
                console.log(`Request for ${articleId}`);
                const article = self.getArticle(articleId);
                if (article) {
                    request.send(self.renderers.gopher.render(article.markdown, { url: article.relativeUrl }));
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

    /**
     * @returns The entire RSS feed as XML
     */
    public getRSS(): string {
        const rss = new RSS({
            title: this.siteTitle,
            feed_url: `http://${this.hostname}/feed/`,
            site_url: `http://${this.hostname}`,
            image_url: "", // TODO RSS image
            language: "English",
        });
        this.getArticles().forEach(article => rss.item({
            date: article.date,
            description: this.renderers.rss.render(article.markdown, { url: article.relativeUrl }),
            title: article.title,
            url: this.getHttpUrl(article),
            author: article.author ?? this.config.author,
            categories: article.tags,
        }));
        //return `<?xml-stylesheet type="text/xsl" href="rss.xsl" media="screen" ?>\n` + rss.xml();
        return rss.xml();
    }

    /**
     * Get the public url for an article
     * @param article Article
     * @returns 
     */
    public getHttpUrl(article: Article) {
        return "https://" + path.join(this.hostname, this.path, article.slug);
    }

    public getArticle(id: string): Article | undefined {
        return this.articleProvider.getArticleById(id);
    }

    public getArticles(): Article[] {
        return this.articleProvider.getArticles();
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


    /** Create XML sitemap */
    public createSitemapXml(): string {
        // TODO make internal function for baseurl
        const baseUrl = `https://${this.hostname}/`;
        function articleToUrl(article: Article): SitemapUrl {
            return {
                loc: `${baseUrl}${article.relativeUrl}`,
                lastmod: article.lastChanged.toISOString(),
                changefreq: 'monthly',
            };
        };

        // TODO add front page etc
        const urls = [...this.articleProvider.getArticles().map(articleToUrl)];

        let obj = {
            urlset: {
                $: {
                    "xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9"
                },
                url: urls
            }
        };
        return `<?xml version="1.0" encoding="utf-8"?>\n` +
            `<?xml-stylesheet href="/sitemap-style.xsl" type="text/xsl"?>\n` +
            xmlBuilder.buildObject(obj);
    }
}

export type SitemapUrl = {
    loc: string,
    lastmod: string,
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
};

export default MdBlog;