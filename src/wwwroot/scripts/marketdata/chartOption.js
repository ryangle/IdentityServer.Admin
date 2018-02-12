class ChartOption {
    constructor(symbol) {
        this.title = {
            text: symbol
        }

        this.tooltip = {
            trigger: 'axis',
            formatter: function (params) {
                var res = params[0].seriesName + ' ' + params[0].name;
                res += '<br/>  开盘 : ' + params[0].value[1] + '  最高 : ' + params[0].value[4];
                res += '<br/>  收盘 : ' + params[0].value[2] + '  最低 : ' + params[0].value[3];
                return res;
            }
        }

        this.legend = {
            data: [symbol]
        }

        this.toolbox = {
            show: true,
            feature: {
                mark: { show: true },
                dataZoom: { show: true },
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        }

        this.dataZoom = {
            show: true,
            realtime: true,
            start: 50,
            end: 100
        }

        this.xAxis = [
            {
                type: 'category',
                boundaryGap: true,
                axisTick: { onGap: false },
                splitLine: { show: false },
                data: []
            }
        ];

        this.yAxis = [
            {
                type: 'value',
                scale: true,
                boundaryGap: [0.01, 0.01]
            }
        ];

        this.series = [
            {
                name: symbol,
                type: 'k',
                itemStyle: {
                    normal: {
                        color: 'green',       
                        color0: 'red',
                        borderColor: 'green',
                        borderColor0: 'red'
                    }
                },
                data: []
            }
        ];
    }

    setTime(time) {
        this.xAxis[0].data.push(time);
    }

    setData(data) {
        this.series[0].data.push(data);
    }
}