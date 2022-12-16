import { APP_NAME } from "./defaults";
import Logger from "./JournalDLogger";

const log = Logger.getLogger(APP_NAME, undefined, true);

export var verbose = (message: string) => { };

export function setVerbose(enable: boolean): void {
    if (enable) {
        verbose = (message: string) => log.debug(message);
    } else {
        verbose = () => { };
    }
}

export default log;