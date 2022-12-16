import { CommandLineAction, CommandLineRemainder, CommandLineStringParameter, CommandLineStringListParameter } from "@rushstack/ts-command-line";
import { Article } from "../Article";
import { MdBlogConfig } from "../MdBlogConfig";

export class NewAction extends CommandLineAction {
    private _args!: CommandLineRemainder;
    private _title!: CommandLineStringParameter;
    private _date!: CommandLineStringParameter;
    private _author!: CommandLineStringParameter;
    private _tags!: CommandLineStringListParameter;
    private _mdblogConfig!: MdBlogConfig;

    public constructor() {
        super({
            actionName: 'new',
            summary: 'Create a new blog article',
            documentation: `Creates a new article with the supplied metadata in the directory specified by the config file.`
        });
    }

    protected async onExecute(): Promise<void> {
        try {
            console.log(this.getFlagParameter('--path'));
            //this._mdblogConfig = getCliConfig();
            //const dir = this._mdblogConfig.rootDir;
            //const title = this._title;
            //const slug = this._args.values[0];


        } catch (err: any) {
            console.error(err.message);
            process.exit(1);
        }

    }

    protected onDefineParameters(): void {
        this._args = this.defineCommandLineRemainder({
            description: 'The remaining arguments are passed along to the command shell.',
        });
    }
}
