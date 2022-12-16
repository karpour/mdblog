const Journald = require('systemd-journald');

interface AdditionalFields {
    [key: string]: string | number;
}

export const JournalDPriority = {
    EMERG: 0,
    ALERT: 1,
    CRIT: 2,
    ERROR: 3,
    WARNING: 4,
    NOTICE: 5,
    INFO: 6,
    DEBUG: 7
} as const;

type ReverseMap<T> = T[keyof T];
export type SyslogPriority = ReverseMap<typeof JournalDPriority>;

/**
 * Class providing a wrapper for journald logging
 */
export default abstract class Logger {
    static readonly EMERG = 0;
    static readonly ALERT = 1;
    static readonly CRIT = 2;
    static readonly ERROR = 3;
    static readonly WARNING = 4;
    static readonly NOTICE = 5;
    static readonly INFO = 6;
    static readonly DEBUG = 7;

    static readonly levels: string[] = [
        "EMERG",
        "ALERT",
        "CRIT",
        "ERROR",
        "WARNING",
        "NOTICE",
        "INFO",
        "DEBUG"
    ];

    protected name: string;

    /**
     * Returns an instance of Logger that logs to the systemd journal, with the name used as SYSLOG_IDENTIFIER for every log message the logger emits
     * @param name Name of the logger instance, defaults to "Node-Logger"
     */
    public static getLogger(name: string, persistentFields: AdditionalFields = {}, logToConsole: boolean = false): Logger {
        if (process.platform === 'linux') {
            return new JournaldLogger(name, persistentFields, logToConsole);
        }
        console.warn("Logging to system logs isn't supported on this platform, falling back to console logging.");
        return new ConsoleLogger(name);
    }

    /**
     * Creates an instance of Logger, with the name used as SYSLOG_IDENTIFIER for every log message the logger emits
     * @param name Name of the logger instance, defaults to "Node-Logger"
     */
    protected constructor(name: string) {
        this.name = name;
    }

    /**
     * Logs a message.
     * @param message Message to log. Newlines will be stripped out and replaced by whitespace
     * @param priority Log Priority between 0 (Logger.EMERG) and 7 (Logger.DEBUG)
     * @param additionalFields Additionalfields as key->value object, where key must be an ALL_CAPS string and value is either a string or a number
     */
    public abstract log(message: string, priority: number, additionalFields: AdditionalFields): void;

    /**
     * Logs a message with the EMERG priority.
     * @param message Message to log. Newlines will be stripped out and replaced by whitespace
     * @param additionalFields Additionalfields as key->value object, where key must be a string and value is either a string or a number
     */
    public emerg(message: string, additionalFields: AdditionalFields = {}) {
        this.log(message, Logger.EMERG, additionalFields);
    }

    /**
    * Logs a message with the ALERT priority.
    * @param message Message to log. Newlines will be stripped out and replaced by whitespace
    * @param additionalFields Additionalfields as key->value object, where key must be a string and value is either a string or a number
    */
    public alert(message: string, additionalFields: AdditionalFields = {}) {
        this.log(message, Logger.ALERT, additionalFields);
    }

    /**
    * Logs a message with the CRIT priority.
    * @param message Message to log. Newlines will be stripped out and replaced by whitespace
    * @param additionalFields Additionalfields as key->value object, where key must be a string and value is either a string or a number
    */
    public crit(message: string, additionalFields: AdditionalFields = {}) {
        this.log(message, Logger.CRIT, additionalFields);
    }

    /**
    * Logs a message with the ERROR priority.
    * @param message Message to log. Newlines will be stripped out and replaced by whitespace
    * @param additionalFields Additionalfields as key->value object, where key must be a string and value is either a string or a number
    */
    public error(message: string, additionalFields: AdditionalFields = {}) {
        this.log(message, Logger.ERROR, additionalFields);
    }

    /**
    * Logs a message with the WARNING priority.
    * @param message Message to log. Newlines will be stripped out and replaced by whitespace
    * @param additionalFields Additionalfields as key->value object, where key must be a string and value is either a string or a number
    */
    public warning(message: string, additionalFields: AdditionalFields = {}) {
        this.log(message, Logger.WARNING, additionalFields);
    }

    /**
    * Logs a message with the NOTICE priority.
    * @param message Message to log. Newlines will be stripped out and replaced by whitespace
    * @param additionalFields Additionalfields as key->value object, where key must be a string and value is either a string or a number
    */
    public notice(message: string, additionalFields: AdditionalFields = {}) {
        this.log(message, Logger.NOTICE, additionalFields);
    }

    /**
    * Logs a message with the INFO priority.
    * @param message Message to log. Newlines will be stripped out and replaced by whitespace
    * @param additionalFields Additionalfields as key->value object, where key must be a string and value is either a string or a number
    */
    public info(message: string, additionalFields: AdditionalFields = {}) {
        this.log(message, Logger.INFO, additionalFields);
    }

    /**
    * Logs a message with the DEBUG priority.
    * @param message Message to log. Newlines will be stripped out and replaced by whitespace
    * @param additionalFields Additionalfields as key->value object, where key must be a string and value is either a string or a number
    */
    public debug(message: string, additionalFields: AdditionalFields = {}) {
        this.log(message, Logger.DEBUG, additionalFields);
    }
}

/**
 * Logger that logs to systemd journal
 */
class JournaldLogger extends Logger {
    private consoleLogger: ConsoleLogger | undefined = undefined;
    private journalD: any = null;

    constructor(name: string, persistentFields: AdditionalFields, logToConsole: boolean = false) {
        super(name);
        this.journalD = new Journald({ ...persistentFields, SYSLOG_IDENTIFIER: this.name });
        if (logToConsole) {
            this.consoleLogger = new ConsoleLogger(name);
        }
    }

    public log(message: string, priority: number, additionalFields: AdditionalFields = {}): void {
        priority = priority >= 0 && priority <= 7 ? priority : 6; // Default priority is INFO (6)

        this.consoleLogger?.log(message, priority, additionalFields);

        message = message.split(/\r\n|\r|\n/).join(' ').trim(); //Replace newlines

        switch (priority) {
            case Logger.EMERG: this.journalD.emerg(message, additionalFields); break;
            case Logger.ALERT: this.journalD.alert(message, additionalFields); break;
            case Logger.CRIT: this.journalD.crit(message, additionalFields); break;
            case Logger.ERROR: this.journalD.err(message, additionalFields); break;
            case Logger.WARNING: this.journalD.warning(message, additionalFields); break;
            case Logger.NOTICE: this.journalD.notice(message, additionalFields); break;
            case Logger.INFO: this.journalD.info(message, additionalFields); break;
            case Logger.DEBUG: this.journalD.debug(message, additionalFields); break;
        }
    }
}


/**
 * Logger that logs to the system console, rather than system logs
 */
class ConsoleLogger extends Logger {
    constructor(name: string) {
        super(name);
    }

    public log(message: string, priority: number, additionalFields: AdditionalFields = {}): void {
        priority = priority >= 0 && priority <= 7 ? priority : 6; // Default priority is INFO (6)

        message = message.split(/\r\n|\r|\n/).join(' ').trim(); //Replace newlines
        var output: string = `[${this.name}][${Logger.levels[priority]}] ${message}`;
        for (const param in additionalFields) { // Add additional params
            output += ` [${param}=${additionalFields[param]}]`;
        }
        switch (priority) {
            case 0: // EMERG
            case 1: // ALERT
            case 2: // CRIT
            case 3: // ERROR
                console.error(output);
                break;
            case 4: // WARNING
                console.warn(output);
                break;
            case 5: // NOTICE
            case 6: // INFO
            case 7: // DEBUG
                console.log(output);
                break;
            default: break;
        }
    }
}