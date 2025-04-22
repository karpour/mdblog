import { CommandLineAction, CommandLineRemainder, CommandLineStringParameter, CommandLineStringListParameter } from "@rushstack/ts-command-line";
import { MdBlogConfig } from "../MdBlogConfig";
import { getConfig } from "./cliConfig";
import DefaultArticleProvider from "../DefaultArticleProvider";

export class ListAction extends CommandLineAction {


    public constructor() {
        super({
            actionName: 'list',
            summary: 'list articles',
            documentation: `List all articles.`
        });
    }

    protected async onExecute(): Promise<void> {
        try {
            const config = getConfig();
            const articleProvider = await DefaultArticleProvider.create(config.rootDir, config.basePath);
            articleProvider.getArticles().forEach(article => {
                console.log(article.slug);
            });
        } catch (err: any) {
            console.error(err.message);
            process.exit(1);
        }

    }

    protected onDefineParameters(): void {
    }
}
