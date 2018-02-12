var request;
if (!request) {
    request = {};
}

request.connect = function(ip) {
    request.websocket = new WebSocket(ip);

    request.websocket.onopen = function () {
        request.websocket.binaryType = "arraybuffer";
        request.logon();
    };
    request.websocket.onclose = function() {
        request.connect(ip);
    };
    request.websocket.onmessage = function (evt) {
        var bin = new Uint8Array(evt.data);
        if (bin.length > 0) {
            request.receive(bin);
        }
    };
    request.websocket.onerror = function(evt) {
        request.error(evt);
    };
}

request.error = function(evt) {
    console.log(`Error: ${evt.data}`);
}

request.receive = function(message) {
    var evt = msgHelper.crack(message);
    switch (evt.msgTypeToString) {
    case "A":   //登录成功返回
        //setTimeout("heartbeat()", 10000);
        console.log("logon");
        request.history();
        break;
    case "W":   //报价
        var data = msgHelper.getData(evt);
        switch (data.type) {
            case "tick": marketData.receive(data); break;  //行情
            case "bar": historicalData.receive(data); break;    //历史
        }
        break;
    case "YS":
        var mDReject = msgHelper.getMDReject(evt);
        if (mDReject == "TransportFinish") { //历史数据发送完毕或无数据
            console.log("发送完毕");
            historicalData.receiveFinish();
            request.sub();
        }
        break;
    case "S":   //昨收报价
        var quote = getQuote(evt);
        //screen.showQuote(quote);
        break;
    case "AG":
        console.log(code);
        var quoteReject = getQuoteReject(evt);
        console.log(quoteReject);
        if (quoteReject == "Pass") { //昨收发送完毕
            console.log("发送完毕");
        }
        break;
    }
}

request.logon = function() {
    var username = "accountid2";
    var password = "1Qaz....";
    var entity = { username: username, password: password };
    var objEnc = msgHelper.chooseEncoder("Logon");
    var buffer = msgHelper.encodeHeader(objEnc);
    var code = msgHelper.encodeBody(objEnc, buffer, "Logon", entity);
    request.doSend(code);
}

request.sub = function() {
    var symbols = "CADJPY";
    var entity = { symbol: symbols, types: 5, Bid: true, Ask: true, Mid: true, Change: true, ChangeRate: true };
    var objEnc = msgHelper.chooseEncoder("MarketDataRequest");
    var buffer = msgHelper.encodeHeader(objEnc);
    var code = msgHelper.encodeBody(objEnc, buffer, "MarketDataRequest", entity);
    request.doSend(code);
}

request.history = function () {
    var symbols = "CADJPY";
    var start = new Date(new Date() - (9 * 60 * 60 * 1000));
    var end = new Date(new Date() - (8 * 60 * 60 * 1000));
    var entity = { symbol: symbols, period: "m1", startTime: start, endTime: end };
    var objEnc = msgHelper.chooseEncoder("HistoricMarketDataRequest");
    var buffer = msgHelper.encodeHeader(objEnc);
    var code = msgHelper.encodeBody(objEnc, buffer, "HistoricMarketDataRequest", entity);
    console.log(code);
    request.doSend(code);
}

request.doSend = function(message) {
    var buffer = new Uint8Array(message.length);
    for (var i = 0; i < message.length; i++) {
        buffer[i] = message[i];
    }
    request.websocket.send(buffer.buffer); 
}