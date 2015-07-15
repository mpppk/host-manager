import express = require("express");
import HostMapper = require("./hostMapper");
import bodyParser = require("body-parser");
/*hostManager.router.use(bodyParser.json());*/

export class HostRouterBuilder{
  private hostMapper: HostMapper;
  private router: express.Router;

  constructor(private port: string, private host: string){
    this.hostMapper = new HostMapper(port, host);
    this.router = express.Router();
  }

  getHostRouter(): express.Router{
    this.router.use(bodyParser.json());
    this.router.route("/")
      .get((req, res) => {
        this.hostMapper.getUrls();
        res.send("look console.");
      })
      .post((req, res) => {
        console.log("in getHostRouter post");
        console.log(req.body);
        // titleを取得してhashに追加
        const title = req.body.title || "no_title";

        //urlが格納されているプロパティを探す. *_urlsというkeyで格納されている前提
        const urls = this.findUrlsFromRequest(req, "urls");

        this.hostMapper.addUrls(urls, title);
        res.json(req.body);
      });
    return this.router;
  }

  private findUrlsFromRequest(req, searchWord: string): string[]{
    for (var key in req.body) {
      if (key.indexOf(searchWord) != -1) {
        return req.body[key];
      }
    }
  }
}
