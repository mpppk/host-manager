var express = require("express");
var HostMapper = require("hostMapper");
var HostRouterBuilder = (function () {
    function HostRouterBuilder(port, host) {
        this.port = port;
        this.host = host;
        this.hostMapper = new HostMapper(port, host);
        this.router = express.Router();
    }
    HostRouterBuilder.prototype.getHostRouter = function () {
        var _this = this;
        this.router.route("/")
            .get(function (req, res) {
            _this.hostMapper.getUrls();
            res.send("look console.");
        })
            .post(function (req, res) {
            var title = req.body.title || "no_title";
            var urls = _this.findUrlsFromRequest(req, "urls");
            _this.hostMapper.setUrls(urls, title);
            res.json(req.body);
        });
        return this.router;
    };
    HostRouterBuilder.prototype.findUrlsFromRequest = function (req, searchWord) {
        for (var key in req.body) {
            if (key.indexOf(searchWord) != -1) {
                return req.body[key];
            }
        }
    };
    return HostRouterBuilder;
})();
