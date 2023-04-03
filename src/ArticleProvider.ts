import { Article } from "./Article";

abstract class ArticleProvider {
    protected constructor(protected rootDir: string, protected basePath: string) {
        // TODO check if path exists and is readable
    }

    public get articleDirectory(): string {
        return this.rootDir;
    }



    public abstract getArticleById(id: string): Article | undefined;
    public abstract getArticles(): Article[];
    public getArticlesPage(amount?: number, page: number = 1, filter?: (a: Article) => boolean): Article[] {
        let result = this.getArticles();
        if (filter)
            result = result.filter(filter);
        let p = page ?? 1;
        //validatePositiveInteger(page)
        if (amount !== undefined) {
            p -= 1;
            result = result.slice(amount * page, amount * page + amount);
        }
        return result;
    }
}

export default ArticleProvider;
