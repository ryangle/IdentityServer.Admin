var marketData;
var historicalData;
if (!marketData) {
    marketData = {};
}
if (!historicalData) {
    historicalData = {};
}

historicalData.dataMap = new Map();
historicalData.chartMap = new Map();
historicalData.lastMap = new Map();

/**
 * 传入参数对象属性列表
 * obj.symbol,
 * obj.time,
 * obj.bid
 */
marketData.receive = function(market) {
    var symbol = market.symbol;
    var option;
    if (historicalData.dataMap.has(symbol)) {
        option = historicalData.dataMap.get(symbol);
        var dataTime = moment(market.time);
        var endTime = historicalData.lastMap.get(symbol).closeTime;
        if (dataTime.isBefore(endTime, "millisecond")) {
            var datas = option.series[0].data;
            var length = datas.length;
            var data = datas[length - 1];
            data[1] = market.bid;
            if (data[1] < data[2]) {
                data[2] = data[1];
            } else if (data[1] > data[3]) {
                data[3] = data[1];
            }
        } else {
            var bar = historicalData.createNewBar(market, endTime);
            var timestamp = moment(bar.openTime).format("YYYY-MM-DD HH:mm:ss");
            var timeRange = new TimeRange(bar.openTime, bar.closeTime);
            historicalData.lastMap.set(symbol, timeRange);
            option.setTime(timestamp);
            var chartData = [bar.open, bar.close, bar.low, bar.high];
            option.setData(chartData);
        }
        historicalData.show(symbol);
    }
}

historicalData.createNewBar = function(market) {
    var symbol = market.symbol;
    var dataTime = moment(market.time);
    var tr = historicalData.lastMap.get(symbol);
    var openTime = tr.openTime;
    var closeTime = tr.closeTime;
    var tf = new Timeframe();
    var timeframe = tf.getTimeframeByTimeRange(openTime, closeTime);
    var timeRange = tf.getTimeRangeByTimeframe(dataTime, timeframe);
    var bar = {
        openTime: timeRange.openTime,
        closeTime: timeRange.closeTime,
        open: market.bid,
        close: market.bid,
        high: market.bid,
        low: market.bid
    };
    return bar;
}

/**
 * 传入参数对象属性列表
 * obj.symbol
 * obj.openTime
 * obj.closeTime
 * obj.open
 * obj.close
 * obj.high,
 * obj.low
 */
historicalData.receive = function(history) {
    var symbol = history.symbol;
    var option;
    if (historicalData.dataMap.has(symbol)) {
        option = historicalData.dataMap.get(symbol);
    } else {
        option = new ChartOption(symbol);
        historicalData.dataMap.set(symbol, option);
    }
    var timestamp = moment(history.openTime).format("YYYY-MM-DD HH:mm:ss");
    option.setTime(timestamp);
    var data = [history.open, history.close, history.low, history.high];
    option.setData(data);
    var openTime = moment(history.openTime);
    var closeTime = moment(history.closeTime);
    var timeRange = new TimeRange(openTime, closeTime);
    historicalData.lastMap.set(symbol, timeRange);
}

historicalData.receiveFinish = function() {
    historicalData.showAll();
}

historicalData.show = function(symbol) {
    if (!historicalData.dataMap.has(symbol)) {
        return;
    }

    var chart;
    if (historicalData.chartMap.has(symbol)) {
        chart = historicalData.chartMap.get(symbol);
    } else {
        chart = echarts.init(document.getElementById(`${symbol}_chart`));
        if (chart == null) return;
        historicalData.chartMap.set(symbol, chart);
    }

    var option = historicalData.dataMap.get(symbol);
    chart.setOption(option);
}

historicalData.showAll = function() {
    var symbols = historicalData.dataMap.keys();
    for (let symbol of symbols) {
        historicalData.show(symbol);
    }
}