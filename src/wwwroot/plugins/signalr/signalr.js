class Signalr {
    constructor(ip) {
        var url = `ws://${ip}/hubs?id=`;
        this.recordSeparator = String.fromCharCode(0x1e);
        this.app = new Application(this);
        
        this.websocket = new WebSocket(url);
        this.websocket.onopen = ((evt) => this.onConnected(evt));
        this.websocket.onclose = ((evt) => this.onDisconnected(evt));
        this.websocket.onmessage = ((evt) => this.onMessage(evt.data));
        this.websocket.onerror = ((evt) => this.onError(evt));
        this.format = {
            type: 1,
            nonblocking: false
        }
        
    }

    onConnected(evt) {
        var firstMsg = new Object();
        firstMsg.protocol = "json";
        console.log(`send:${JSON.stringify(firstMsg) + this.recordSeparator}`);
        this.websocket.send(JSON.stringify(firstMsg) + this.recordSeparator);
        console.log("CONNECT SUCCESS");
        this.app.start();
    }

    onDisconnected(evt) {
        console.log("DISCONNECTED");
    }

    onMessage(data) {
        data = data.substring(0, data.length - 1);
        data = JSON.parse(data);
        if (data.type === 1) {
            var message = JSON.parse(data.arguments[0]);
            message.msgType = data.target;
            this.app.onMessage(message);
        }
    }

    onError(evt) {
        console.error(evt.data);
    }

    send(method, message) {
        this.format.target = method;
        this.format.invocationId = "id";
        this.format.arguments = [message];

        message = JSON.stringify(this.format);
        console.log(message + this.recordSeparator);
        this.websocket.send(message + this.recordSeparator);
    }

    stop() {
        this.websocket.close();
    }
}