import {
    CommandLineFlagParameter,
    CommandLineParser,
    CommandLineStringParameter
} from "@rushstack/ts-command-line";
import { setVerbose } from "../log";
import { setConfigPath } from "./cliConfig";
import CreateBlogAction from "./CreateBlogAction";
import { NewAction } from "./NewAction";
import { ServeAction } from "./ServeAction";

export class MdBlogCli extends CommandLineParser {
    private _verbose!: CommandLineFlagParameter;
    private _configPath!: CommandLineStringParameter;

    public constructor() {
        super({
            toolFilename: 'mdblog',
            toolDescription: 'CLI for managing an MdBlog'
        });
        this.addAction(new NewAction());
        this.addAction(new ServeAction());
        this.addAction(new CreateBlogAction());
    }

    protected onDefineParameters(): void {
        this._configPath = this.defineStringParameter({
            description: "Path to a valid config.json file or a directory that contains a valid config.json file.",
            parameterLongName: "--path",
            parameterShortName: "-p",
            argumentName: "PATH",
            defaultValue: ".",
        });

        this._verbose = this.defineFlagParameter({
            parameterLongName: '--verbose',
            parameterShortName: '-v',
            description: 'Show extra logging detail'
        });
    }

    protected onExecute(): Promise<void> {
        setVerbose(this._verbose.value);
        setConfigPath(this._configPath.value as string);
        return super.onExecute();
    }
}

new MdBlogCli().execute();