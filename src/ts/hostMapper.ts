import redis = require("redis");

class HostMapper {
    private _client : redis.RedisClient;
    get client(){ return this._client; }

    constructor(private port: string, private host: string){
      this._client = redis.createClient(port, host);
    }

    setUrls(urls: string[], title: string): void{
      for (var i in urls) {
        this.setUrl(urls[i], title, i);
      }
    }

    private setUrl(url: string, title: string, no: number): void{
        const hostName: string = this.getHostName(url);
        // Setに追加
        this.client.sadd("urlsTitle:" + title, url);

        // 各URLに関する情報を格納
        this.client.hset("urlInfo:" + url, "title", title);
        this.client.hset("urlInfo:" + url, "no", no);

        // 各ホストに関する情報を格納
        // 日付
        const date = new Date();
        this.client.zadd("lastAccessTime", date.getTime(), hostName);
    }

    getUrls() {
      this.client.zrevrangebyscore("lastAccessTime", "+inf", "-inf", "withscores", (err, data)=> {
          if (err){ return console.log(err); }
          console.log("most short last access time:");
          console.log(data);
      });
    }

    getHostName(url): string{
      let hostName = url;
      hostName = hostName.replace("https://", "");
      hostName = hostName.replace("http://", "");
      hostName = hostName.split("/")[0];
      return hostName;
    }

}

export = HostMapper;
