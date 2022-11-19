import { Socket } from "net";




enum TelnetCommand {
    /** End of subnegotiation parameters */
    SE = 240,
    /** No operation */
    NOP = 241,
    /** Data mark */
    DM = 242,
    /** Break */
    BRK = 243,
    /** Suspend (a.k.a. "interrupt process") */
    IP = 244,
    /** Abort output */
    AO = 245,
    /** Are you there? */
    AYT = 246,
    /** Erase character */
    EC = 247,
    /** Erase line */
    EL = 248,
    /** Go ahead */
    GA = 249,
    /** Subnegotiation */
    SB = 250,
    /** Will */
    WILL = 251,
    /** Wont */
    WONT = 252,
    /** Do */
    DO = 253,
    /** Dont */
    DONT = 254,
    /** Interpret as command */
    IAC = 255
};

const TELNET_COMMAND_NAMES: { [key: number]: string; } = {};
for (const command in TelnetCommand) {
    TELNET_COMMAND_NAMES[(TelnetCommand as any)[command]] = command;
}

enum TelnetOption {
    /** @see http://tools.ietf.org/html/rfc856 */
    TRANSMIT_BINARY = 0,
    /** 
     * Echo
     * @see http://tools.ietf.org/html/rfc857 */
    ECHO = 1,
    /** @see http://tools.ietf.org/html/rfc671 */
    RECONNECT = 2,
    /** @see http://tools.ietf.org/html/rfc858 */
    SUPPRESS_GO_AHEAD = 3,
    /** Approx Message Size Negotiation 
     * @see https://google.com/search?q=telnet+option+AMSN */
    AMSN = 4,
    /** 
     * @see http://tools.ietf.org/html/rfc859
     */
    STATUS = 5,
    /** @see http://tools.ietf.org/html/rfc860 */
    TIMING_MARK = 6,
    /** Remote Controlled Transmssion and Echoing Telnet Option
     * @see http://tools.ietf.org/html/rfc726
     * @see http://tools.ietf.org/html/rfc563 */
    RCTE = 7,
    /** (Negotiate) Output Line Width
     * @see http://tools.ietf.org/html/rfc1073
     * @see https://google.com/search?q=telnet+option+NAOL
     */
    NAOL = 8,
    /** (Negotiate) Output Page Size 
    /* @see https://google.com/search?q=telnet+option+NAOP
    /* @see http://tools.ietf.org/html/rfc1073 */
    NAOP = 9,
    /** Telnet Output Carriage-Return Disposition Option 
     * @see http://tools.ietf.org/html/rfc652 */
    NAOCRD = 10,
    /** Telnet Output Horizontal Tabstops Option 
     * @see http://tools.ietf.org/html/rfc653 */
    NAOHTS = 11,
    /** @see http://tools.ietf.org/html/rfc654 */
    NAOHTD = 12,
    /** @see http://tools.ietf.org/html/rfc655 */
    NAOFFD = 13,
    /** @see http://tools.ietf.org/html/rfc656 */
    NAOVTS = 14,
    /** @see http://tools.ietf.org/html/rfc657 */
    NAOVTD = 15,
    /** @see http://tools.ietf.org/html/rfc658 */
    NAOLFD = 16,
    /**
     * Telnet Extended Ascii Option 
     * @see http://tools.ietf.org/html/rfc698 
     */
    EXTEND_ASCII = 17,
    /** @see http://tools.ietf.org/html/rfc727 */
    LOGOUT = 18,
    /** @see http://tools.ietf.org/html/rfc735 */
    BM = 19,
    /** 
     * @see http://tools.ietf.org/html/rfc732
     * @see http://tools.ietf.org/html/rfc1043
     */
    DET = 20,
    /** 
     * @see http://tools.ietf.org/html/rfc734
     * @see http://tools.ietf.org/html/rfc736
     */
    SUPDUP = 21,
    /** @see http://tools.ietf.org/html/rfc749 */
    SUPDUP_OUTPUT = 22,
    /** @see http://tools.ietf.org/html/rfc779 */
    SEND_LOCATION = 23,
    /** @see http://tools.ietf.org/html/rfc1091 */
    TERMINAL_TYPE = 24,
    /** @see http://tools.ietf.org/html/rfc885 */
    END_OF_RECORD = 25,
    /** @see http://tools.ietf.org/html/rfc927 */
    TUID = 26,
    /** @see http://tools.ietf.org/html/rfc933 */
    OUTMRK = 27,
    /** @see http://tools.ietf.org/html/rfc946 */
    TTYLOC = 28,
    /** @see http://tools.ietf.org/html/rfc1041 */
    REGIME_3270 = 29,
    /** @see http://tools.ietf.org/html/rfc1053 */
    X3_PAD = 30,
    /** @see http://tools.ietf.org/html/rfc1073 */
    NAWS = 31,
    /** @see http://tools.ietf.org/html/rfc1079 */
    TERMINAL_SPEED = 32,
    /** @see http://tools.ietf.org/html/rfc1372 */
    TOGGLE_FLOW_CONTROL = 33,
    /** @see http://tools.ietf.org/html/rfc1184 */
    LINEMODE = 34,
    /** @see http://tools.ietf.org/html/rfc1096 */
    X_DISPLAY_LOCATION = 35,
    /** @see http://tools.ietf.org/html/rfc1408 */
    ENVIRON = 36,
    /** 
     * @see http://tools.ietf.org/html/rfc2941
     * @see http://tools.ietf.org/html/rfc1416
     * @see http://tools.ietf.org/html/rfc2942
     * @see http://tools.ietf.org/html/rfc2943
     * @see http://tools.ietf.org/html/rfc2951 */
    AUTHENTICATION = 37,
    /** @see http://tools.ietf.org/html/rfc2946 */
    ENCRYPT = 38,
    /** @see http://tools.ietf.org/html/rfc1572 */
    NEW_ENVIRON = 39,
    /** @see http://tools.ietf.org/html/rfc2355 */
    TN3270E = 40,
    /** @see https://google.com/search?q=telnet+option+XAUTH */
    XAUTH = 41,
    /** @see http://tools.ietf.org/html/rfc2066 */
    CHARSET = 42,
    /** @see http://tools.ietf.org/html/draft-barnes-telnet-rsp-opt-01 */
    RSP = 43,
    /** @see http://tools.ietf.org/html/rfc2217 */
    COM_PORT_OPTION = 44,
    /** @see http://tools.ietf.org/html/draft-rfced-exp-atmar-00 */
    SLE = 45,
    /** @see http://tools.ietf.org/html/draft-altman-telnet-starttls-02 */
    START_TLS = 46,
    /** @see http://tools.ietf.org/html/rfc2840 */
    KERMIT = 47,
    /** @see http://tools.ietf.org/html/draft-croft-telnet-url-trans-00 */
    SEND_URL = 48,
    /** @see http://tools.ietf.org/html/draft-altman-telnet-fwdx-01 */
    FORWARD_X = 49,
    /** @see https://google.com/search?q=telnet+option+PRAGMA_LOGON */
    PRAGMA_LOGON = 138,
    /** @see https://google.com/search?q=telnet+option+SSPI_LOGON */
    SSPI_LOGON = 139,
    /** @see https://google.com/search?q=telnet+option+PRAGMA_HEARTBEAT */
    PRAGMA_HEARTBEAT = 140,
    /**
     * EXTENDED-OPTIONS-LIST 
     * @see http://tools.ietf.org/html/rfc861 */
    EXOPL = 255
};

const TELNET_OPTION_NAMES: { [key: number]: string; } = {};
for (let command in TelnetOption) {
    TELNET_OPTION_NAMES[(TelnetOption as any)[command]] = command;
}

export type CommandAction =
    TelnetCommand.WILL |
    TelnetCommand.WONT |
    TelnetCommand.DO |
    TelnetCommand.DONT;


const enum TelnetState {
    /** Last byte processed was DO code. */
    STATE_DO_RECEIVED,
    /** Last byte processed was DONT code. */
    STATE_DONT_RECEIVED,
    /** Last byte processed was IAC code. */
    STATE_IAC_RECEIVED,
    /** Initial state. */
    STATE_INITIAL,
    /** Currently receiving sub-negotiation data. */
    STATE_RECEIVING_SUBNEGOTIATION,
    /** Last byte processed was SB. */
    STATE_SUBNEGOTIATION_STARTED,
    /** Last byte processed was WILL code. */
    STATE_WILL_RECEIVED,
    /** Last byte processed was WONT code. */
    STATE_WONT_RECEIVED,
}


export default class TelnetServer {
    protected state: TelnetState;

    public constructor(protected socket: Socket) {
        this.state = TelnetState.STATE_INITIAL;
        socket.on("data", data => this.handleData(data));

    }

    public sendDo(option: TelnetOption) {
        console.log(`>> DO ${TELNET_OPTION_NAMES[option]}`);
        this.sendCommand(TelnetCommand.DO, [option]);
    }

    public sendDont(option: TelnetOption) {
        console.log(`>> DONT ${TELNET_OPTION_NAMES[option]}`);
        this.sendCommand(TelnetCommand.DONT, [option]);
    }

    public sendWill(option: TelnetOption) {
        console.log(`>> WILL ${TELNET_OPTION_NAMES[option]}`);
        this.sendCommand(TelnetCommand.WILL, [option]);
    }

    public sendWont(option: TelnetOption) {
        console.log(`>> WONT ${TELNET_OPTION_NAMES[option]}`);
        this.sendCommand(TelnetCommand.WONT, [option]);
    }


    public sendCommand(command: TelnetCommand, args: number[]) {
        this.socket.write(new Uint8Array([TelnetCommand.IAC, command, ...args]));
    }

    private currentCommand: number | undefined;
    private handleData(data: Buffer) {
        for (let i: number = 0; i < data.length; i++) {
            const byte = data.readUint8(i);
            if (!this.handleCommandByte(byte)) {
                const char = String.fromCharCode(byte);
                if (char === "a") {

                }
                process.stdout.write(char);
            }

        }
        //console.log(data.toString('hex'));
    };

    public get height(): number {
        return 0;
    }
    
    public get width(): number {
        return 0;
    }

    protected handleDo(option: TelnetOption) {
        console.log(`<< DO ${TELNET_OPTION_NAMES[option] ?? option}`);
        this.sendWont(option);
    }

    protected handleDont(option: TelnetOption) {

    }

    protected handleWill(option: TelnetOption) {

    }

    protected handleWont(option: TelnetOption) {

    }

    /**
     * Handles one byte
     * @param byte byte to process
     * @returns true if byte is part of a command, false if byte is data
     */
    private handleCommandByte(byte: number): boolean {
        switch (this.state) {
            case TelnetState.STATE_INITIAL:
                if (byte == TelnetCommand.IAC) {
                    this.state = TelnetState.STATE_IAC_RECEIVED;
                    break;
                }
                // If state is initial and there is no IAC byte sent, return false
                return false;
            case TelnetState.STATE_IAC_RECEIVED:
                /** console.log(`Received command ${COMMANDNAMES[byte]}`); */

                switch (byte) {
                    case TelnetCommand.DO: this.state = TelnetState.STATE_DO_RECEIVED;
                        break;
                    case TelnetCommand.DONT: this.state = TelnetState.STATE_DONT_RECEIVED;
                        break;
                    case TelnetCommand.WILL: this.state = TelnetState.STATE_WILL_RECEIVED;
                        break;
                    case TelnetCommand.WONT: this.state = TelnetState.STATE_WONT_RECEIVED;
                        break;
                    case TelnetCommand.SB: this.state = TelnetState.STATE_SUBNEGOTIATION_STARTED;
                        break;
                    case TelnetCommand.IAC: console.error(`Double IAC received`); break;
                    default: this.handleCommand(byte);
                }
                break;
            case TelnetState.STATE_RECEIVING_SUBNEGOTIATION:
                break;
            case TelnetState.STATE_SUBNEGOTIATION_STARTED:

            case TelnetState.STATE_DO_RECEIVED:
                this.handleDo(byte);
                this.state = TelnetState.STATE_INITIAL;
                break;

            case TelnetState.STATE_DONT_RECEIVED:
                console.log(`<< DONT ${TELNET_OPTION_NAMES[byte] ?? byte}`);
                this.handleDont(byte);

                this.state = TelnetState.STATE_INITIAL;
                break;

            case TelnetState.STATE_WILL_RECEIVED:
                console.log(`<< WILL ${TELNET_OPTION_NAMES[byte] ?? byte}`);
                this.handleWill(byte);

                this.state = TelnetState.STATE_INITIAL;
                break;

            case TelnetState.STATE_WONT_RECEIVED:
                console.log(`<< WONT ${TELNET_OPTION_NAMES[byte] ?? byte}`);
                this.handleWont(byte);

                this.state = TelnetState.STATE_INITIAL;
                break;
        }
        return true;
    }
    protected handleCommand(byte: number) {
        if (TELNET_COMMAND_NAMES[byte]) {
            console.log(`Command: ${TELNET_COMMAND_NAMES[byte]}`);
        } else {
            console.error(`Invalid command ${byte.toString(16)}`);
        }
    }
}