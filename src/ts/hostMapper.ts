import redis = require("redis");

// URLに関する情報を持つクラス
class URLData{
  constructor(private _url: string, private _title: string, private _no: number){}

  get url(){ return this._url; }
  get title(){ return this._title; }
  // 同じタイトルを持つURLの中での序列
  get no(){ return this._no; }
}

class URLDetail extends URLData{
  get lastAccessTime(){ return this._lastAccessTime; }

  get remainWaitTime(){
    var time: number = URLDetail.getCurrentUnixTime() - this.lastAccessTime;
    return time;
  }

  private _hostName: string;
  get hostName(){ return this._hostName; }

  constructor(_url: string, _title: string, _no: number, private _lastAccessTime: number){
    super(_url, _title, _no);
    this._hostName = HostMapper.getHostName(_url);
  }

  static getCurrentUnixTime(): number{
    const now = new Date();
    //[now]に対して[getTime()]を実行し、[msNow]にミリ秒単位のUNIX TIMESTAMPを代入する
    const msNow = now.getTime();
    //[msNow]を1,000で割り、秒単位のUNIX TIMESTAMPを求める
    return Math.floor( msNow / 1000 );
  }

  toString(): string{
    let str: string = "-- DataDetail --";
    str += "url: " + this.url + "\n";
    str += "title: " + this.title + "\n";
    str += "no: " + this.no + "\n";
    str += "lastAccessTime: " + this.lastAccessTime + "\n";
    str += "remainWaitTime: " + this.remainWaitTime + "\n";
    return str;
  }
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

      // 各URLに関する情報を格納
      this.client.hset("urlInfo:" + data.url, "title", data.title);
      this.client.hset("urlInfo:" + data.url, "no", data.no);
      this.client.incr("urlsMax");

      // 各ホストに関する情報を格納
      // 日付
      const date = new Date();
      this.client.zadd("lastAccessTime", date.getTime(), hostName);
      this.client.sadd("urlsOfHost:" + hostName, data.url);
    }

    getUrl(callback: (data: URLDetail)=>void): void{
      var host: string;
      var url: string;
      var time: number;
      var title: string;
      var no: number;

      this.client.zrevrangebyscore("lastAccessTime", "+inf", "-inf", "withscores", (err, data)=> {
        if (err){ return console.log(err); }
        host = data[0];
        time = data[1];

        // lastAccessTimeを更新
        const date = new Date();
        this.client.zadd("lastAccessTime", date.getTime(), host);

        this.client.srandmember("urlsOfHost:" + host, (err, data) =>{
          if (err){ return console.log(err); }
          url = data;

          this.client.hget("urlInfo:" + url, "title", (err, data) =>{
            if (err){ return console.log(err); }
            title = data;

            this.client.hget("urlInfo:" + url, "no", (err, data) =>{
              if (err){ return console.log(err); }
              no = data;

              let urlDetail: URLDetail = new URLDetail(url, title, no, time);
              console.log(urlDetail.toString());
              callback(urlDetail);
            });
          });
        });
      });
    }

    removeUrl(urlDetail: URLDetail): void{
      // 各URLに関する情報を削除
      this.client.del("urlInfo:" + urlDetail.url);
      this.client.decr("urlsMax");

      // 各ホストに関する情報を格納
      this.client.srem("urlsOfHost:" + urlDetail.hostName, urlDetail.url);
    }

    popUrl(callback: (data:URLDetail)=>void): void{
      this.getUrl((data)=>{
        this.removeUrl(data);
        callback(data);
      });
    }

    hasUrl(callback: (hasUrl:boolean)=>void): void{
      this.client.get("urlsMax", (err, data) => {
        callback(data != "0" && data != null);
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
