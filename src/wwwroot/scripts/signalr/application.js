class Application {
    constructor(signalr) {
        this.signalr = signalr;
        this.msgHelper = new MsgHelper();
        this.subCount = 4;
    }

    start() {
        var entity = { symbols: "CADJPY,EURUSD,GBPUSD,USDCNH" };
        var msg = this.msgHelper.encodeHistoricalDataRequest(entity);
        this.signalr.send("HistoricalDataRequest", msg);
    }

    onMessage(message) {
        switch (message.msgType) {
            case "HistoricalData":
                this.onHistoricalData(message);
                break;
            case "MarketData":
                this.onMarketData(message);
                break;
            case "DataFinish":
                this.onDataFinish();
                break;
            default:
                console.warn(`The message type ${message.msgType} is unsupported`);
                break;
            
        }
        console.log(message);
    }

    onHistoricalData(message) {
        message = this.msgHelper.resolveHistoricalData(message);
        historicalData.receive(message);
    }

    onMarketData(message) {
        message = this.msgHelper.resolveMarketData(message);
        marketData.receive(message);
    }

    onDataFinish() {
        historicalData.receiveFinish();
        this.subCount--;
        if (this.subCount === 0) {
            var entity = { symbols: "CADJPY,EURUSD,GBPUSD,USDCNH" };
            var msg = this.msgHelper.encodeMarketDataRequest(entity);
            this.signalr.send("MarketDataRequest", msg);
        }
    }
}