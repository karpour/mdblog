import { CommandLineParser, CommandLineFlagParameter } from "@rushstack/ts-command-line";

var outsideVerbose: CommandLineFlagParameter;

export class TestCommandLine extends CommandLineParser {
    private _verbose!: CommandLineFlagParameter;

    public constructor() {
        super({
            toolFilename: 'clitest',
            toolDescription: ''
        });
    }

    protected onDefineParameters(): void {
        this._verbose = this.defineFlagParameter({
            parameterLongName: '--verbose',
            parameterShortName: '-v',
            description: 'Show extra logging detail'
        });
        outsideVerbose = this._verbose;
    }

    protected onExecute(): Promise<void> {
        console.log(`outsideVerbose: ${outsideVerbose.value}`);
        console.log(`this._verbose: ${this._verbose.value}`);
        return super.onExecute();
    }
}

new TestCommandLine().execute();