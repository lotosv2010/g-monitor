import tracker from '../utils/tracker';
import { Storage } from '../utils/storage';
import onload from '../utils/onload';

class Timing {
  static storage = Storage.getInstance();
  constructor() {
    this.init();
  }
  private init() {
    onload(function() {
      setTimeout(function() {
        const [navigationEntry] = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const {
          connectStart, connectEnd,
          responseEnd, responseStart,
          requestStart,
          loadEventEnd,
          domComplete, domContentLoadedEventEnd,
          domContentLoadedEventStart,
          domInteractive,
          fetchStart
        } = navigationEntry || {}
        const data = {
          kind: 'experience',
          type: 'timing',
          connectTime: connectEnd - connectStart, // TCP 连接耗时
          ttfbTime: responseStart - requestStart, // ttfb
          responseTime: responseEnd - responseStart, // Response 响应耗时
          parseDomTime: loadEventEnd - domInteractive, // DOM 解析渲染耗时
          domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart, // DomContentLoaded 事件回调耗时
          timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
          domReadyTime: domComplete - domContentLoadedEventEnd, // DOM Ready 耗时
          loadTime: loadEventEnd - fetchStart, // 页面完全加载时间
        }
        Timing.storage.setItem(data);
        tracker.send(data);
      }, 500);
    })
  }
}

export default Timing;