
import TelnetServer from "./TelnetServer";
import net, { Socket } from "net";

const welcomeBanner = `
 Welcome to
 
 :::    :::     :::     :::::::::  :::::::::   ::::::::  :::    ::: :::::::::  
 :+:   :+:    :+: :+:   :+:    :+: :+:    :+: :+:    :+: :+:    :+: :+:    :+: 
 +:+  +:+    +:+   +:+  +:+    +:+ +:+    +:+ +:+    +:+ +:+    +:+ +:+    +:+ 
 +#++:++    +#++:++#++: +#++:++#:  +#++:++#+  +#+    +:+ +#+    +:+ +#++:++#:  
 +#+  +#+   +#+     +#+ +#+    +#+ +#+        +#+    +#+ +#+    +#+ +#+    +#+ 
 #+#   #+#  #+#     #+# #+#    #+# #+#        #+#    #+# #+#    #+# #+#    #+# 
 ###    ### ###     ### ###    ### ###         ########   ########  ###    .net

`;


export default class KarpourTelnetServer extends TelnetServer {
    public constructor(socket: Socket) {
        super(socket);
        this.socket.write(welcomeBanner.replace(/\n/g, '\r\n'));
    }
}

const servers: TelnetServer[] = [];

const port = 2023;

net.createServer((socket: Socket) => {
    console.log(`Connection from ${socket.remoteAddress}`);
    servers.push(new KarpourTelnetServer(socket));
}).listen(port, 'localhost');

console.log(`Server started on port ${port}`);