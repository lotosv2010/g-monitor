// 忽略这个报错
import SlsTracker from '@aliyun-sls/web-track-browser';

let host = "cn-hangzhou.log.aliyuncs.com";
let project = "g-monitor";
let logstore = "g-monitor-store";

function getExtraData() {
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  };
}



class SendTracker {
  private opts: any;
  private tracker: any;
  constructor() {
    this.opts = {
      host, // 所在地域的服务入口。例如cn-hangzhou.log.aliyuncs.com
      project, // Project名称。
      logstore, // Logstore名称。
      time: 10, // 发送日志的时间间隔，默认是10秒。
      count: 10, // 发送日志的数量大小，默认是10条。
      topic: 'topic',// 自定义日志主题。
      source: 'source',
      tags: {},
    }
    this.tracker = new SlsTracker(this.opts)  // 创建SlsTracker对象
  }
  send(data: any = {}, callback?: any) {
    let extraData = getExtraData();
    let logs: any = { ...extraData, ...data };
    // console.log(logs);
    // console.log(JSON.stringify(logs, null, 2));
    
    this.tracker.send(logs)
  }
}

export default new SendTracker();