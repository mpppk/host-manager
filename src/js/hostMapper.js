var redis = require("redis");
var HostMapper = (function () {
    function HostMapper(port, host) {
        this.port = port;
        this.host = host;
        this._client = redis.createClient(port, host);
    }
    Object.defineProperty(HostMapper.prototype, "client", {
        get: function () { return this._client; },
        enumerable: true,
        configurable: true
    });
    HostMapper.prototype.setUrls = function (urls, title) {
        for (var i in urls) {
            this.setUrl(urls[i], title, i);
        }
    };
    HostMapper.prototype.setUrl = function (url, title, no) {
        var hostName = this.getHostName(url);
        this.client.sadd("urlsTitle:" + title, url);
        this.client.hset("urlInfo:" + url, "title", title);
        this.client.hset("urlInfo:" + url, "no", no);
        var date = new Date();
        this.client.zadd("lastAccessTime", date.getTime(), hostName);
    };
    HostMapper.prototype.getUrls = function () {
        this.client.zrevrangebyscore("lastAccessTime", "+inf", "-inf", "withscores", function (err, data) {
            if (err) {
                return console.log(err);
            }
            console.log("most short last access time:");
            console.log(data);
        });
    };
    HostMapper.prototype.getHostName = function (url) {
        var hostName = url;
        hostName = hostName.replace("https://", "");
        hostName = hostName.replace("http://", "");
        hostName = hostName.split("/")[0];
        return hostName;
    };
    return HostMapper;
})();
module.exports = HostMapper;
