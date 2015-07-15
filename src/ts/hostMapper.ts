import redis = require("redis");

// URLに関する情報を持つクラス
class URLData{
  constructor(private _url: string, private _title: string, private _no: number){}

  get url(){ return this._url; }
  get title(){ return this._title; }
  // 同じタイトルを持つURLの中での序列
  get no(){ return this._no; }
}

// ホストに関する情報を持つクラス
class HostData{
  private _name: string;
  get name(){ return this._name; }
}

class HostMapper {
    private _client : redis.RedisClient;
    get client(){ return this._client; }

    constructor(private port: string, private host: string){
      this._client = redis.createClient(port, host);
    }

    addUrls(urls: string[], title: string): void{
      for (var i in urls) { this.addUrl(new URLData(urls[i], title, i)); }
    }

    private addUrl(data: URLData): void{
      const hostName: string = HostMapper.getHostName(data.url);
      // Setに追加
      this.client.sadd("urlsTitle:" + data.title, data.url);

      // 各URLに関する情報を格納
      this.client.hset("urlInfo:" + data.url, "title", data.title);
      this.client.hset("urlInfo:" + data.url, "no", data.no);

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

    getUrl(): void{
      this.client.zrevrangebyscore("lastAccessTime", "+inf", "-inf", "withscores", (err, data)=> {
          if (err){ return console.log(err); }
          console.log(data);
      });
    }

    static getHostName(url): string{
      let hostName = url;
      hostName = hostName.replace("https://", "");
      hostName = hostName.replace("http://", "");
      hostName = hostName.split("/")[0];
      return hostName;
    }

}

export = HostMapper;
