layui.use([],
    function() {
        const ips = document.getElementsByName("ip");
        var ip;
        for (let i = 0; i < ips.length; i++) {
            if (ips[i].checked) {
                ip = ips[i].value;
            }
        }
        if (ip === "other") {
            ip = `ws://${document.getElementById("other").value}/`;
        }
        console.log(ip);
        request.connect(ip);
    }
);