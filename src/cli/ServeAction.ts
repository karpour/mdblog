import { CommandLineAction, CommandLineRemainder } from "@rushstack/ts-command-line";
import { APP_NAME, DEFAULT_CONF_PATH } from "../defaults";



export class ServeAction extends CommandLineAction {

    public constructor() {
        super({
            actionName: 'serve',
            summary: 'Serve an mdblog site',
            documentation: `Serves an mdblog site. If the config file is omitted, ${APP_NAME} will look for the config file at ${DEFAULT_CONF_PATH}`
        });
    }

    protected async onExecute(): Promise<void> {
        console.log(`Serving`)
    }

    protected onDefineParameters(): void {
    }
}
