class Timeframe {
    constructor() {
        this.periods = ["m1", "m5", "m15", "m30", "h1", "h4", "d1", "w1", "mn"];
    }

    getTimeframeByTimeRange(openTime, closeTime) {
        openTime = moment(openTime);
        closeTime = moment(closeTime);
        switch (closeTime.diff(openTime, 'minute')) {
            case 1:
                return "m1";
            case 5:
                return "m5";
            case 15:
                return "m15";
            case 30:
                return "m30";
            case 60:
                return "h1";
            case 240:
                return "h4";
            case 1440:
                return "d1";
            case 10080:
                return "w1";
            default:
                var realDays = closeTime.diff(openTime, 'day');
                var ruleDays = openTime.daysInMonth();
                if (realDays === ruleDays) {
                    return "mn";
                }
                console.log("The time is error");
        }
    }

    getTimeRangeByTimeframe(time, timeframe) {
        time = moment(time);
        var openTime;
        var closeTime;
        switch (timeframe) {
            case "m1":
                openTime = time.startOf('minute');
                closeTime = moment(openTime).add(1, 'm');
                return new TimeRange(openTime, closeTime);
            case "m5":
                openTime = time.startOf('minute').subscribe(time.minute() % 5, 'm');
                closeTime = moment(openTime).add(5, 'm');
                return new TimeRange(openTime, closeTime);
            case "m15":
                openTime = time.startOf('minute').subscribe(time.minute() % 15, 'm');
                closeTime = moment(openTime).add(15, 'm');
                return new TimeRange(openTime, closeTime);
            case "m30":
                openTime = time.startOf('minute').subscribe(time.minute() % 30, 'm');
                closeTime = moment(openTime).add(30, 'm');
                return new TimeRange(openTime, closeTime);
            case "h1":
                openTime = time.startOf('hour');
                closeTime = moment(openTime).add(1, 'h');
                return new TimeRange(openTime, closeTime);
            case "h4":
                openTime = time.startOf('hour').subscribe(time.hour() % 4, 'h');
                closeTime = moment(openTime).add(4, 'h');
                return new TimeRange(openTime, closeTime);
            case "d1":
                openTime = time.startOf('day');
                closeTime = moment(openTime).add(1, 'd');
                return new TimeRange(openTime, closeTime);
            case "w1":
                openTime = time.startOf('isoweek');
                closeTime = moment(openTime).add(7, 'd');
                return new TimeRange(openTime, closeTime);
            case "mn":
                openTime = time.startOf('month');
                closeTime = moment(openTime).add(1, 'M');
                return new TimeRange(openTime, closeTime);
            default:
                console.warn(`The timeframe ${timeframe} is not supported`);
        }
    }
}

class TimeRange {
    constructor(openTime, closeTime) {
        this.openTime = openTime;
        this.closeTime = closeTime;
    }
}