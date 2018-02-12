class MsgHelper {
    encodeMarketDataRequest(entity) {
        var obj = new Object();
        obj.msgType = "V";
        obj.symbols = entity.symbols;
        return JSON.stringify(obj);
    }

    encodeHistoricalDataRequest(entity) {
        var obj = new Object();
        obj.msgType = "VS";
        obj.symbols = entity.symbols;
        obj.start = new Date(new Date() - (1 * 60 * 60 * 1000));
        obj.end = new Date(new Date() - (0 * 60 * 60 * 1000));
        obj.timeframe = "m1";
        return JSON.stringify(obj);
    }

    resolveHistoricalData(message) {
        var resolved = {};
        resolved.symbol = message.Symbol;
        resolved.openTime = message.OpenDateTime;
        resolved.closeTime = message.CloseDateTime;
        resolved.high = message.High;
        resolved.low = message.Low;
        resolved.open = message.Open;
        resolved.close = message.Close;
        return resolved;
    }

    resolveMarketData(message) {
        var resolved = {};
        resolved.symbol = message.Symbol;
        resolved.time = message.Time;
        resolved.bid = message.Bid;
        return resolved;
    }
}