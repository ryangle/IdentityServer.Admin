var msgHelper;
if (!msgHelper) {
    msgHelper = {};
}

msgHelper.msgHeaderEnc = new sbe.MessageHeaderEncoder();
msgHelper.msgHeaderDec = new sbe.MessageHeaderDecoder();
msgHelper.msgHeaderLength = msgHelper.msgHeaderEnc.encodedLength;

msgHelper.beginString = "FIX.4.4";
msgHelper.msgSeqNum = 0;
msgHelper.senderID = `TradeClient${Math.random() * 10000}`;

msgHelper.msgBuild = function(msgName) {
    var objEnc = chooseEncoder(msgName);
    var objDec = chooseDecoder(msgName);
    var buffer = encodeHeader(objEnc);
    var code = encodeBody(objEnc, buffer, msgName);
    var data = decode(code, objDec);
}

msgHelper.chooseEncoder = function(message) {
    switch (message) {
        case "Logon": return new sbe.LogonEncoder();
        case "Logout": return new sbe.LogoutEncoder();
        case "MarketDataRequest": return new sbe.MarketDataRequestEncoder();
        case "HistoricMarketDataRequest": return new sbe.HistoricMarketDataRequestEncoder();
        case "Heartbeat": return new sbe.HeartbeatEncoder();
        case "QuoteRequest": return new sbe.QuoteRequestEncoder();
    }
}

msgHelper.chooseDecoder = function(message) {
    switch (message) {
        case "Logon": return new sbe.LogonDecoder();
        case "Logout": return new sbe.LogoutDecoder();
        case "MarketDataRequest": return new sbe.MarketDataRequestDecoder();
        case "HistoricMarketDataRequest": return new sbe.HistoricMarketDataRequestDecoder();
        case "Heartbeat": return new sbe.HeartbeatDecoder();
        case "QuoteRequest": return new sbe.QuoteRequestDecoder();
    }
}

msgHelper.encodeMarketDataRequest = function(obj, buffer, entity) {
    var symbol = entity.symbol;
    var subType = 49;
    var offset = msgHelper.msgHeaderLength;

    obj.wrap(buffer, offset)
        .putMsgTypeByString("V")
        .msgSeqNum(++msgHelper.msgSeqNum);

    obj = msgHelper.setCurrentTime(obj);

    obj.subscriptionRequestType(subType)
        .marketDepth(0)
        .mDUpdateType(0);

    var noMDEntryTypes = obj.noMDEntryTypesCount(entity.types);
    if (entity.Bid)
        noMDEntryTypes.next().mDEntryType(48);
    if (entity.Ask)
        noMDEntryTypes.next().mDEntryType(49);
    if (entity.Mid)
        noMDEntryTypes.next().mDEntryType(72);
    if (entity.Change)
        noMDEntryTypes.next().mDEntryType(82);
    if (entity.ChangeRate)
        noMDEntryTypes.next().mDEntryType(83);

    if (symbol.indexOf(",") > 0) {
        var symbols = symbol.split(",");
        var noRelatedSym = obj.noRelatedSymCount(symbols.length);
        for (var i = 0; i < symbols.length; i++) {
            noRelatedSym.next().
                securityIDByString(symbols[i]).securityIDSourceByString("8");
        }
    } else {
        var noRelatedSym = obj.noRelatedSymCount(1);
        noRelatedSym.next().securityIDByString(symbol).securityIDSourceByString("8");
    }

    obj.beginStringByString(msgHelper.beginString)
        .senderCompIDByString(msgHelper.senderID)
        .targetCompIDByString("SimpleAcceptor")
        .mDReqIDByString("12346");

    return msgHelper.outEncode(obj);
}

msgHelper.encodeHistoricMarketDataRequest = function(obj, buffer, entity) {
    var symbol = entity.symbol;
    var start = entity.startTime;
    var end = entity.endTime;
    var period = entity.period;
    var subType = 49;
    var offset = msgHelper.msgHeaderLength;

    obj.wrap(buffer, offset)
        .putMsgTypeByString("VS")
        .msgSeqNum(++msgHelper.msgSeqNum)
        .marketDepth(48);

    obj = msgHelper.setCurrentTime(obj);
    obj.tradSesStartTime
        .year(start.getFullYear())
        .month(start.getMonth() + 1)
        .day(start.getDate())
        .hour(start.getHours())
        .minute(start.getMinutes())
        .second(start.getSeconds())
        .millisecond(start.getMilliseconds());
    obj.tradSesEndTime
        .year(end.getFullYear())
        .month(end.getMonth() + 1)
        .day(end.getDate())
        .hour(end.getHours())
        .minute(end.getMinutes())
        .second(end.getSeconds())
        .millisecond(end.getMilliseconds());

    obj.putPeriodByString(period)
        .subscriptionRequestType(subType);
    
    var noMDEntryTypes;
    if (period == "tick") {
        noMDEntryTypes = obj.noMDEntryTypesCount(2);
        noMDEntryTypes
            .next().mDEntryType(48)
            .next().mDEntryType(49);
    } else {
        noMDEntryTypes = obj.noMDEntryTypesCount(5);
        noMDEntryTypes
            .next().mDEntryType(52)
            .next().mDEntryType(53)
            .next().mDEntryType(55)
            .next().mDEntryType(56)
            .next().mDEntryType(66);
    }

    var noRelatedSym;
    if (symbol.indexOf(",") > 0) {
        var symbols = symbol.split(",");
        noRelatedSym = obj.noRelatedSymCount(symbols.length);
        for (var i = 0; i < symbols.length; i++) {
            noRelatedSym.next().securityIDByString(symbols[i]).securityIDSourceByString("8");
        }
    } else {
        noRelatedSym = obj.noRelatedSymCount(1);
        noRelatedSym.next().securityIDByString(symbol).securityIDSourceByString("8");
    }

    obj.beginStringByString(msgHelper.beginString)
        .senderCompIDByString(msgHelper.senderID)
        .targetCompIDByString("SimpleAcceptor")
        .mDReqIDByString("12346");

    return msgHelper.outEncode(obj);
}

msgHelper.encodeLogout = function(obj, buffer, entity) {
    var offset = msgHelper.msgHeaderLength;
    obj.wrap(buffer, offset)
        .msgSeqNum(++msgHelper.msgSeqNum);

    obj = msgHelper.setCurrentTime(obj);

    obj.beginStringByString(msgHelper.beginString)
        .msgTypeByString("5")
        .senderCompIDByString(msgHelper.senderID)
        .targetCompIDByString("SimpleAcceptor")
        .textByString("logout");

    return msgHelper.outEncode(obj);
}

msgHelper.encodeLogon = function(obj, buffer, entity) {
    var offset = msgHelper.msgHeaderLength;

    obj.wrap(buffer, offset)
        .putMsgTypeByString("A")
        .msgSeqNum(++msgHelper.msgSeqNum);

    obj = msgHelper.setCurrentTime(obj);

    obj.encryptMethod(0)
        .heartBtInt(30)
        .resetSeqNumFlag(89)
        .beginStringByString(msgHelper.beginString)
        .senderCompIDByString(msgHelper.senderID)
        .targetCompIDByString("SimpleAcceptor")
        .usernameByString(entity.username)
        .passwordByString(entity.password);

    return msgHelper.outEncode(obj);
}

msgHelper.encodeHeartbeat = function(obj, buffer, entity) {
    var offset = msgHelper.msgHeaderLength;

    obj.wrap(buffer, offset)
        .putMsgTypeByString("0")
        .msgSeqNum(++msgHelper.msgSeqNum);

    obj = msgHelper.setCurrentTime(obj);

    obj.beginStringByString(msgHelper.beginString)
        .senderCompIDByString(msgHelper.senderID)
        .targetCompIDByString("SimpleAcceptor")
        .putTestReqIDByString("Client01");

    return msgHelper.outEncode(obj);
}

msgHelper.encodeQuoteRequest = function(obj, buffer, entity) {
    var symbol = entity.symbols;
    var date = entity.date;
    var offset = msgHelper.msgHeaderLength;

    obj.wrap(buffer, offset)
        .putMsgTypeByString("R")
        .msgSeqNum(++msgHelper.msgSeqNum);

    obj = msgHelper.setCurrentTime(obj);

    if (symbol.indexOf(",") > 0) {
        var symbols = symbol.split(",");
        var noRelatedSym = obj.noRelatedSymCount(symbols.length);
        for (var i = 0; i < symbols.length; i++) {
            noRelatedSym.next().securityIDByString(symbols[i]).securityIDSourceByString("8").settlDateByString(date);
        }
    } else {
        var noRelatedSym = obj.noRelatedSymCount(1);
        noRelatedSym.next().securityIDByString(symbol).securityIDSourceByString("8").settlDateByString(date);
    }

    obj.beginStringByString(msgHelper.beginString)
        .senderCompIDByString(msgHelper.senderID)
        .targetCompIDByString("SimpleAcceptor")
        .quoteReqIDByString("12347");

    return msgHelper.outEncode(obj);
}

msgHelper.encodeBody = function(obj, buffer, message, entity) {
    switch (message) {
        case "Logon": return msgHelper.encodeLogon(obj, buffer, entity); break;
        case "Logout": return msgHelper.encodeLogout(obj, buffer, entity); break;
        case "MarketDataRequest": return msgHelper.encodeMarketDataRequest(obj, buffer, entity); break;
        case "HistoricMarketDataRequest": return msgHelper.encodeHistoricMarketDataRequest(obj, buffer, entity); break;
        case "Heartbeat": return msgHelper.encodeHeartbeat(obj, buffer, entity); break;
        case "QuoteRequest": return msgHelper.encodeQuoteRequest(obj, buffer, entity); break;
    }
}

msgHelper.encodeHeader = function(obj) {
    var buffer = new sbe.ExpandableBuffer();
    msgHelper.msgHeaderEnc.wrap(buffer, 0)
        .blockLength(obj.sbeBlockLength)
        .templateId(obj.sbeTemplateId)
        .schemaId(obj.sbeSchemaId)
        .version(obj.sbeSchemaVersion);

    return buffer;
}

msgHelper.outEncode = function(obj) {
    var totalLength = obj.encodedLength + msgHelper.msgHeaderLength + 6;
    var buffer = obj.buffer.buffer.slice(0, obj.encodedLength + msgHelper.msgHeaderLength);
    var totalLengthOffset = obj.buffer.putuint(0, totalLength, sbe.ByteOrder.big_endian);
    obj.buffer.putushort(totalLengthOffset, 0xeb50, sbe.ByteOrder.big_endian);
    var framingHeader = obj.buffer.buffer.slice(0, 6);
    var sbeBuffer = framingHeader.concat(buffer);
    return sbeBuffer;
}

msgHelper.decode = function(message, obj) {
    var buffer = new sbe.ExpandableBuffer(message);
    obj.wrap(buffer, msgHelper.msgHeaderDec.encodedLength, obj.sbeBlockLength, 1);
    return obj.toString();
}

msgHelper.crack = function(message) {
    var buffer = new sbe.ExpandableBuffer(message);
    var msgHeader = new sbe.MessageHeaderDecoder();
    msgHeader.wrap(buffer, 6);
    var templateId = msgHeader.templateId;
    var obj;
    switch (templateId) {
        case 1001: obj = new sbe.HeartbeatDecoder(); break;
        case 1002: obj = new sbe.LogonDecoder(); break;
        case 1003: obj = new sbe.LogoutDecoder(); break;
        case 1004: obj = new sbe.MarketDataRequestDecoder(); break;
        case 1005: obj = new sbe.MarketDataSnapshotFullRefreshDecoder(); break;
        case 1006: obj = new sbe.MarketDataRequestRejectDecoder(); break;
        case 1007: obj = new sbe.RejectDecoder(); break;
        case 1008: obj = new sbe.HistoricMarketDataRequestDecoder(); break;
        case 1009: obj = new sbe.HistoricMarketDataRequestRejectDecoder(); break;
        case 1010: obj = new sbe.ResendRequestDecoder(); break;
        case 1011: obj = new sbe.QuoteRequestDecoder(); break;
        case 1012: obj = new sbe.QuoteDecoder(); break;
        case 1013: obj = new sbe.QuoteRequestRejectDecoder(); break;
        default: console.log(`The message ${templateId} is undefined`); break;
    }
    obj.wrap(buffer, 14, obj.sbeBlockLength, obj.sbeSchemaVersion);
    return obj;
}

msgHelper.getData = function(obj) {
    var noMDEntries = obj.noMDEntries;
    var data = new Object();
    if (noMDEntries.count > 0) {
        while (noMDEntries.hasNext()) {
            noMDEntries = noMDEntries.next();
            var price = msgHelper.getNumber(noMDEntries.mDEntryPx);
            var change = msgHelper.getNumber(noMDEntries.change);
            var changeRate = msgHelper.getNumber(noMDEntries.changeRate);
            price = parseFloat(price);
            change = parseFloat(change);
            changeRate = parseFloat(changeRate);
            switch (noMDEntries.mDEntryType) {
                case 48:
                    data.bid = price;
                    data.type = "tick";
                    data.time = msgHelper.getDataTime(noMDEntries);
                    data.quoteCondition = sbe.QuoteCondition[noMDEntries.quoteCondition];
                    data.change = change;
                    data.changeRate = changeRate;
                    break;
                case 49:
                    data.ask = price;
                    data.type = "tick";
                    data.time = msgHelper.getDataTime(noMDEntries);
                    data.quoteCondition = sbe.QuoteCondition[noMDEntries.quoteCondition];
                    break;
                case 52:
                    data.open = price;
                    data.type = "bar";
                    data.openTime = msgHelper.getDataTime(noMDEntries);
                    break;
                case 53:
                    data.close = price;
                    data.closeTime = msgHelper.getDataTime(noMDEntries);
                    break;
                case 55: data.high = price; break;
                case 56: data.low = price; break;
                case 72:
                    data.mid = price;
                    data.type = "tick";
                    data.quoteCondition = sbe.QuoteCondition[noMDEntries.quoteCondition];
                    break;
            }
        }
    }

    obj.beginStringToString;
    obj.msgTypeToString;
    obj.senderCompIDToString;
    obj.targetCompIDToString;

    data.symbol = obj.securityIDToString;
    return data;
}

msgHelper.getQuote = function(obj) {
    var data = new Object();
    data.close = msgHelper.getNumber(obj.bidPx);
    data.delta = msgHelper.getNumber(obj.yieldRedemptionPrice);
    obj.beginStringToString;
    obj.msgTypeToString;
    obj.senderCompIDToString;
    obj.targetCompIDToString;
    data.symbol = obj.securityIDToString;
    data.quoteReqID = obj.quoteReqID;
    return data;
}

msgHelper.setCurrentTime = function(obj, prop) {
    var currentTime = new Date();
    obj.sendingTime
        .year(currentTime.getFullYear())
        .month(currentTime.getMonth() + 1)
        .day(currentTime.getDate())
        .hour(currentTime.getHours())
        .minute(currentTime.getMinutes())
        .second(currentTime.getSeconds())
        .millisecond(currentTime.getMilliseconds());
    return obj;
}

msgHelper.getDataTime = function(mDEntry) {
    var date = mDEntry.mDEntryDate;
    var time = mDEntry.mDEntryTime;
    return new Date(date * 86400000 + time);
}

msgHelper.getMDReject = function(obj) {
    return sbe.MDReqRejReason[obj.mDReqRejReason];
}

msgHelper.getQuoteReject = function(obj) {
    return sbe.QuoteRequestRejectReason[obj.quoteRequestRejectReason];
}

msgHelper.getNumber = function(obj) {
    var mantissa = obj.mantissa;
    var exponent = obj.exponent;
    return (mantissa * Math.pow(10, exponent)).toFixed(-exponent);
}