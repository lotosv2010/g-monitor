import tracker from '../utils/tracker';
import { Storage } from '../utils/storage';
import onload from '../utils/onload';
import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';

class Timing {
  static storage = Storage.getInstance();
  constructor() {
    this.init();
  }
  // 获取加载时间
  private getLoadTime() {
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
  // 获取性能指标
  private getPerformanceIndicators() {
    // FP	First Paint(首次绘制)	包括了任何用户自定义的背景绘制，它是首先将像素绘制到屏幕的时刻
    // FCP	First Content Paint(首次内容绘制)	是浏览器将第一个 DOM 渲染到屏幕的时间,可能是文本、图像、SVG等,这其实就是白屏时间
    // FMP	First Meaningful Paint(首次有意义绘制)	页面有意义的内容渲染的时间
    // LCP	(Largest Contentful Paint)(最大内容渲染)	代表在viewport中最大的页面元素加载的时间
    // DCL	(DomContentLoaded)(DOM加载完成)	当 HTML 文档被完全加载和解析完成之后,DOMContentLoaded 事件被触发，无需等待样式表、图像和子框架的完成加载
    // L	(onLoad)	当依赖的资源全部加载完毕之后才会触发
    // TTI	(Time to Interactive) 可交互时间	用于标记应用已进行视觉渲染并能可靠响应用户输入的时间点
    // FID	First Input Delay(首次输入延迟)	用户首次和页面交互(单击链接，点击按钮等)到页面响应交互的时间
    let FP: PerformanceEntry, FCP: PerformanceEntry, FMP: PerformanceEntry, LCP: LargestContentfulPaint;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-paint') {
          FP = entry;
        }
        if (entry.name === 'first-contentful-paint') {
          FCP = entry;
        }
      });
    }).observe({ type: 'paint', buffered: true });

    new PerformanceObserver((entryList, observer) => {
      const perfEntries = entryList.getEntries();
      FMP = perfEntries[0]; // ! FMP 已废弃
      observer.disconnect();
    }).observe({ entryTypes: ['element']});

    new PerformanceObserver((entryList, observer) => {
      const perfEntries = entryList.getEntries();
      const lastEntry = perfEntries[perfEntries.length - 1];
      LCP = lastEntry as LargestContentfulPaint;
      observer.disconnect();
    }).observe({ entryTypes: ['largest-contentful-paint']});

    new PerformanceObserver((entryList, observer) => {
      const lastEvent = getLastEvent();
      let perfEntries = entryList.getEntries();
      const firstInput = perfEntries[0] as PerformanceEventTiming;
      if(firstInput) {
        let inputDelay = firstInput.processingStart - firstInput.startTime;// 处理延迟
        let duration = firstInput.duration;// 处理耗时
        if(inputDelay > 0 && duration > 0) {
          const data = {
            kind: 'experience',
            type: 'firstInputDelay',
            inputDelay: inputDelay || 0,
            duration: duration || 0,
            startTime: firstInput.startTime,
            selector: lastEvent ? getSelector(lastEvent) : ''
          }
          Timing.storage.setItem(data);
          console.log(data);
          tracker.send(data);
        }
      }
      observer.disconnect();
    }).observe({ type: 'first-input', buffered: true});

    onload(function() {
      setTimeout(function() {
        const data = {
          kind: 'experience',
          type: 'paint',
          FP: FP?.startTime || 0,
          FCP: FCP?.startTime || 0,
          FMP: FMP?.startTime|| 0,
          LCP: LCP?.renderTime || LCP?.loadTime || 0,
        }
        Timing.storage.setItem(data);
        tracker.send(data);
      }, 500);
    })
  }
  private init() {
    this.getLoadTime();
    this.getPerformanceIndicators();
  }
}

export default Timing;