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
        // 取り出すものがある場合のみ処理を行う
        this.hostMapper.hasUrl((hasUrl)=>{
          if(hasUrl){
            if (req.query.pop === "1") {
              this.hostMapper.popUrl((data)=>{
                res.send(data.toObject());
              });
            }else{
              this.hostMapper.getUrl((data)=>{
                res.send(data.toObject());
              });
            }
          }else{
            res.send("{title:\"nothing\"}");
          }
        });
      })
      .post((req, res) => {
        console.log(req.body);
        // titleを取得してhashに追加
        const title = req.body.title || "no_title";

        var body = req.body;
        if("collection1" in req.body){ body = this.modifyKimono(req.body); }

        //urlが格納されているプロパティを探す. *_urlsというkeyで格納されている前提
        const urls = this.findUrlsFromRequest(body, "urls");

        this.hostMapper.addUrls(urls, title);
        res.json(req.body);
      });
    return this.router;
  }

  private modifyKimono(kimono){
    var body = {urls: []};
    var collection = kimono.results.collection1;
    for(var c of collection){
      body.urls.push(c.src);
    }
    return body;
  }

  private findUrlsFromRequest(body, searchWord: string): string[]{
    for (var key in body) {
      if (key.indexOf(searchWord) != -1) {
        return body[key];
      }
    }
  }
}
