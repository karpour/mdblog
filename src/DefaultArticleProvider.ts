import { readdirSync, statSync } from "fs";
import path from "path";
import { Article } from "./Article";
import ArticleProvider from "./ArticleProvider";
import log, { verbose } from "./log";


class DefaultArticleProvider extends ArticleProvider {
    protected articlesById: { [key: string]: Article; } = {};
    protected articles: Article[] = [];

    private scanDir(dir: string): Article[] {
        if (Article.isArticleDir(dir)) {
            try {
                return [new Article(dir, this.basePath)];
            } catch (err: any) {
                log.warning(`Error processing Article "${dir}": ${err.message}`);
                return [];
            }
        }
        return readdirSync(dir)
            .map(d => path.join(dir, d))
            .filter(d => statSync(d).isDirectory())
            .map(d => this.scanDir(d))
            .flat();
    }

    public static create(path: string, basePath?: string): Promise<ArticleProvider> {
        const instance = new DefaultArticleProvider(path, basePath ?? "");
        return instance.rescan();
    }

    protected async rescan(): Promise<DefaultArticleProvider> {
        verbose(`Scanning`);
        this.articles = this.scanDir(this.rootDir).sort((a: Article, b: Article) => b.date.getTime() - a.date.getTime());
        this.articles.forEach(a => { this.articlesById[a.getId()] = a; });
        return this;
    }

    public getArticleById(id: string): Article | undefined {
        return this.articlesById[id];
    }
    public getArticles(): Article[] {
        return this.articles;
    }

}

export default DefaultArticleProvider;