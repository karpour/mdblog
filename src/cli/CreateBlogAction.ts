import { CommandLineAction, CommandLineIntegerParameter, CommandLineRemainder, CommandLineStringParameter } from "@rushstack/ts-command-line";
import { existsSync, mkdirSync } from "fs";
import MdBlog from "../MdBlog";
import PromptSync from "prompt-sync";
import { CONFIG_DEFAULT } from "../defaults";
import { resolve } from "path";
const prompt = PromptSync({ sigint: true });


function promptWithDefault(promptText: string, defaultValue: string): string {
    let val = prompt(`${promptText} (${defaultValue}): `);
    if (!val) {
        val = defaultValue;
    }
    return val;
}

function promptIntWithDefault(promptText: string, defaultValue: number): number {
    if (!Number.isInteger(defaultValue)) {
        throw new Error(`Not an integer: ${defaultValue}`);
    }
    let strVal = prompt(`${promptText} (${defaultValue}): `);
    if (!strVal) {
        return defaultValue;
    }
    return parseInt(strVal);
}

class CreateBlogAction extends CommandLineAction {
    private _args!: CommandLineRemainder;
    private _rootdir!: CommandLineStringParameter;
    private _name!: CommandLineStringParameter;
    private _hostName!: CommandLineStringParameter;
    private _httpPort!: CommandLineIntegerParameter;
    private _gopherPort!: CommandLineIntegerParameter;
    private _author!: CommandLineStringParameter;
    private _syslogIdentifier!: CommandLineStringParameter;

    public constructor() {
        super({
            actionName: 'create-blog',
            summary: 'Create a new blog',
            documentation: `Creates a new article with the supplied metadata in the directory specified by the config file.`
        });
    }

    protected onDefineParameters(): void {
        this._rootdir = this.defineStringParameter({
            description: "Root directory of the blog",
            parameterLongName: "--root-dir",
            parameterShortName: "-r",
            argumentName: "PATH",
        });
        this._name = this.defineStringParameter({
            description: "Name of the blog",
            parameterLongName: "--name",
            parameterShortName: "-n",
            argumentName: "NAME",
        });
        this._hostName = this.defineStringParameter({
            description: "Hostname of the blog (e.g. www.myblog.com)",
            parameterLongName: "--host-name",
            parameterShortName: "-H",
            argumentName: "ADDRESS",
        });
        this._httpPort = this.defineIntegerParameter({
            description: `HTTP Port`,
            parameterLongName: "--http-port",
            parameterShortName: "-p",
            argumentName: "PORT",
        });
        this._gopherPort = this.defineIntegerParameter({
            description: `Gopher Port`,
            parameterLongName: "--gopher-port",
            parameterShortName: "-g",
            argumentName: "PORT",
        });
        this._author = this.defineStringParameter({
            description: "Name of the blog author",
            parameterLongName: "--author",
            parameterShortName: "-A",
            argumentName: "NAME",
        });
        this._syslogIdentifier = this.defineStringParameter({
            description: "Syslog identifier",
            parameterLongName: "--syslog-identifier",
            parameterShortName: "-S",
            argumentName: "IDENTIFIER",
        });
    }

    protected async onExecute(): Promise<void> {
        MdBlog.createBlog({
            siteTitle: this._name.value ?? promptWithDefault("Blog name", CONFIG_DEFAULT.siteTitle),
            rootDir: resolve(this._rootdir.value ?? promptWithDefault("Root directory", CONFIG_DEFAULT.rootDir)),
            hostname: this._hostName.value ?? promptWithDefault("Host name", CONFIG_DEFAULT.hostname),
            httpPort: this._httpPort.value ?? promptIntWithDefault("HTTP Port", CONFIG_DEFAULT.httpPort!),
            gopherPort: this._gopherPort.value ?? promptIntWithDefault("Gopher Port", CONFIG_DEFAULT.gopherPort!),
            author: this._author.value ?? promptWithDefault("Author", CONFIG_DEFAULT.author),
            syslogIdentifier: this._syslogIdentifier.value ?? promptWithDefault("Syslog identifer", CONFIG_DEFAULT.syslogIdentifier!),
        });
    }
}

export default CreateBlogAction;