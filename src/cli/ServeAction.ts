import { CommandLineAction, CommandLineRemainder } from "@rushstack/ts-command-line";
import DefaultArticleProdider from "../DefaultArticleProvider";
import { APP_NAME, DEFAULT_CONF_PATH } from "../defaults";
import MdBlog from "../MdBlog";
import { getConfig } from "./cliConfig";



export class ServeAction extends CommandLineAction {

    public constructor() {
        super({
            actionName: 'serve',
            summary: 'Serve an mdblog site',
            documentation: `Serves an mdblog site. If the config file is omitted, ${APP_NAME} will look for the config file at ${DEFAULT_CONF_PATH}`
        });
    }

    protected async onExecute(): Promise<void> {
        const config = getConfig();
        const articleProvider = await DefaultArticleProdider.create(config.rootDir, config.basePath);
        const mdBlog = new MdBlog(config, articleProvider);
        mdBlog.serve();
    }

    protected onDefineParameters(): void {
    }
}
