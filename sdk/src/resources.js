import {onload} from './util.js';

// 过滤无效数据
function filterTime(a, b) {
  return (a > 0 && b > 0 && (a - b) >= 0) ? (a - b) : undefined;
}

let resolvePerformanceTiming = (timing) => {
  let o = {
    initiatorType: timing.initiatorType,
    name: timing.name,
    // 连接过程
    duration: parseInt(timing.duration),
    redirect: filterTime(timing.redirectEnd, timing.redirectStart), // 重定向
    dns: filterTime(timing.domainLookupEnd, timing.domainLookupStart), // DNS解析
    connect: filterTime(timing.connectEnd, timing.connectStart), // TCP建连
    network: filterTime(timing.connectEnd, timing.startTime), // 网络总耗时
    // 接受过程
    send: filterTime(timing.responseStart, timing.requestStart), // 发送开始到接受第一个返回
    receive: filterTime(timing.responseEnd, timing.responseStart), // 接收总时间
    request: filterTime(timing.responseEnd, timing.requestStart), // 总时间

    // 核心指标
    ttfb: filterTime(timing.responseStart, timing.requestStart), // 首字节时间
  };

  return o;
};

let resolveEntries = (entries) => entries.map(item => resolvePerformanceTiming(item));

let resources = {
  init: (cb) => {
    let performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance;
    if (!performance || !performance.getEntries) {
      return void 0;
    }

    if (window.PerformanceObserver) {
      // 动态获得每一个资源信息
      let observer = new window.PerformanceObserver((list) => {
        try {
          let entries = list.getEntries();
          cb(resolveEntries(entries));
        } catch (e) {
          console.error(e);
        }
      });
      observer.observe({
        entryTypes: ['resource']
      })
    } else {
      // 在onload之后获取所有的资源新
      onload(() => {
        let entries = performance.getEntriesByType('resource');
        cb(resolveEntries(entries));
      });
    }
  },
};

export default resources;
