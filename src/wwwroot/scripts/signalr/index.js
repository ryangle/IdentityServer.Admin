layui.use([],
    function () {
        const ip = "127.0.0.1:8099";
        var signalr = new Signalr(ip);
    }
);