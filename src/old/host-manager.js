var hostManager = {};

var express = require('express');
hostManager.router = express.Router();

var bodyParser = require('body-parser');
hostManager.router.use(bodyParser.json());

hostManager.router.route('/')
  .get(function(req, res){
    getUrls();
    res.send("look console.");
  })
  .post(function(req, res){
    // titleを取得してhashに追加
    var title = req.body.title || "no_title";

    // var hashTitle = "hash:" + hostName + ":" + title;
    // hostManager.client.hset(hashTitle, "title", title);

    //urlが格納されているプロパティを探す
    // urlは*_urlsというkeyで格納されている前提
    var searchWord = "urls";
    var urls = [];
    for (var key in req.body) {
      if (key.indexOf(searchWord) != -1) {
        urls = req.body[key];
        break;
      }
    }

    for (var i in urls) {
      var hostName = getHostName(urls[i]);
      console.log("sadd");
      // Setに追加
      var urlsSetName = "set:" + hostName + ":" + title;
      hostManager.client.sadd(urlsSetName, urls[i]);
      // hostManager.client.smembers("set:" + hostName, function(err, data){
      //   if (err) return console.log(err);
      //   console.log("srandmember");
      //   console.log(data);
      // });
    }

    setUrls(urls, title);

    res.json(req.body);
  });

var setUrls = function(urls, title){
  for (var i in urls) {
    setUrl(urls[i], title, i);
  }
};

var setUrl = function(url, title, no){
  var hostName = getHostName(url);
  // Setに追加
  hostManager.client.sadd("urlsTitle:" + title, url);

  // 各URLに関する情報を格納
  hostManager.client.hset("urlInfo:" + url, "title", title);
  hostManager.client.hset("urlInfo:" + url, "no", no);

  // 各ホストに関する情報を格納
  // 日付
  var date = new Date();
  hostManager.client.zadd("lastAccessTime", date.getTime(), hostName);
};

var getUrls = function () {
  var result = hostManager.client.zrevrangebyscore("lastAccessTime", "+inf", "-inf", "withscores", function (err, data) {
      if (err) return console.log(err);
      console.log("most short last access time:");
      console.log(data);
  });
};

var getHostName = function(url){
  var hostName = url;
  hostName = hostName.replace("https://", "");
  hostName = hostName.replace("http://", "");
  hostName = hostName.split("/")[0];
  return hostName;
};


module.exports = hostManager;
