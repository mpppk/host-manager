var express = require("express");
var hello = require("./hello-world-router");
var app = express();
app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));
var port = process.env.REDIS_PORT_6379_TCP_PORT;
var host = process.env.REDIS_PORT_6379_TCP_ADDR;
app.use("/hello", hello.getHelloWorldRouter(port, host));
var client = require("redis").createClient(port, host);
var hostManager = require("./host-manager");
hostManager.client = client;
app.use("/host", hostManager.router);
app.listen(app.get("port"), function () {
    console.log("Node app is running on port", app.get("port"));
});
