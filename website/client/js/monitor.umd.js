(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  // https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceTiming

  let perf = {
    init: (cb) => {
      let cycleFreq = 100; // 循环轮询的时间
      let isDOMReady = false;
      let isOnload = false;
      let performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance;

      let Util = {
        addEventListener: function (name, callback, useCapture) {
          if (window.addEventListener) {
            return window.addEventListener(name, callback, useCapture);
          } else if (window.attachEvent) {
            return window.attachEvent('on' + name, callback);
          }
        },
        // DOM解析完成
        domready: function (callback) {
          if ( isDOMReady === true ) { return void 0; }
          let timer = null;

          if ( document.readyState === 'interactive' ) {
            runCheck();
          } else if (document.addEventListener) {
            // 开始循环检测是否 DOMContentLoaded
            document.addEventListener('DOMContentLoaded', function () {
              runCheck();
            }, false);
          } else if (document.attachEvent) {
            document.attachEvent('onreadystatechange', function () {
              runCheck();
            });
          }

          function runCheck() {
            if ( performance.timing.domInteractive ) { // 停止循环检测，运行callback
              clearTimeout(timer);
              callback();
              isDOMReady = true;
            } else { // 再次循环检测
              timer = setTimeout(runCheck, cycleFreq);
            }
          }
        },
        // 页面加载完成
        onload: function (callback) {
          if ( isOnload === true ) { return void 0; }
          let timer = null;

          if (document.readyState === 'complete') {
            runCheck();
          } else {
            Util.addEventListener('load', function () {
              runCheck();
            }, false);
          }

          function runCheck() {
            if ( performance.timing.loadEventEnd ) {
              clearTimeout(timer);
              callback();
              isOnload = true;
            } else {
              timer = setTimeout(runCheck, cycleFreq);
            }
          }
        }
      };

      let reportPerf = function () {
        if (!performance) {
          return void 0;
        }

        // 过滤无效数据；
        function filterTime(a, b) {
          return (a > 0 && b > 0 && (a - b) >= 0) ? (a - b) : undefined;
        }

        // append data from window.performance
        let timing = performance.timing;
        // let timing = performance.getEntriesByType('navigation')[0];

        let perfData = {
          // 网络建连
          pervPage: filterTime(timing.fetchStart, timing.navigationStart), // 上一个页面
          redirect: filterTime(timing.responseEnd, timing.redirectStart), // 页面重定向时间
          dns: filterTime(timing.domainLookupEnd, timing.domainLookupStart), // DNS查找时间
          connect: filterTime(timing.connectEnd, timing.connectStart), // TCP建连时间
          network: filterTime(timing.connectEnd, timing.navigationStart), // 网络总耗时

          // 网络接收
          send: filterTime(timing.responseStart, timing.requestStart), // 前端从发送到接收到后端第一个返回
          receive: filterTime(timing.responseEnd, timing.responseStart), // 接受页面时间
          request: filterTime(timing.responseEnd, timing.requestStart), // 请求页面总时间

          // 前端渲染
          dom: filterTime(timing.domComplete, timing.domLoading), // dom解析时间
          loadEvent: filterTime(timing.loadEventEnd, timing.loadEventStart), // loadEvent时间
          frontend: filterTime(timing.loadEventEnd, timing.domLoading), // 前端总时间

          // 关键阶段
          load: filterTime(timing.loadEventEnd, timing.navigationStart), // 页面完全加载总时间
          domReady: filterTime(timing.domContentLoadedEventStart, timing.navigationStart), // domready时间
          interactive: filterTime(timing.domInteractive, timing.navigationStart), // 可操作时间
          ttfb: filterTime(timing.responseStart, timing.navigationStart),  // 首字节时间
        };

        return perfData;
      };

      Util.domready(function () {
        let perfData = reportPerf();
        perfData.type = 'domready';
        cb(perfData);
      });

      Util.onload(function () {
        let perfData = reportPerf();
        perfData.type = 'onload';
        cb(perfData);
      });
    }
  };

  let onload = (cb) => {
    if (document.readyState === 'complete') {
      cb();
      return;
    }
    window.addEventListener('load', cb);
  };

  // 过滤无效数据
  function filterTime(a, b) {
    return (a > 0 && b > 0 && (a - b) >= 0) ? (a - b) : undefined;
  }

  let resolvePerformanceTiming = (timing) => {
    let o = {
      initiatorType: timing.initiatorType,
      name: timing.name,
      duration: parseInt(timing.duration),
      redirect: filterTime(timing.redirectEnd, timing.redirectStart), // 重定向
      dns: filterTime(timing.domainLookupEnd, timing.domainLookupStart), // DNS解析
      connect: filterTime(timing.connectEnd, timing.connectStart), // TCP建连
      network: filterTime(timing.connectEnd, timing.startTime), // 网络总耗时

      send: filterTime(timing.responseStart, timing.requestStart), // 发送开始到接受第一个返回
      receive: filterTime(timing.responseEnd, timing.responseStart), // 接收总时间
      request: filterTime(timing.responseEnd, timing.requestStart), // 总时间

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
        });
      } else {
        onload(() => {
          let entries = performance.getEntriesByType('resource');
          cb(resolveEntries(entries));
        });
      }
    },
  };

  // 性能监控
  perf.init((perfData) => {
    console.log('perfData', perfData);
  });

  // 资源监控
  resources.init((resourcesData) => {
    console.log('resourcesData', resourcesData);
  });

}));
//# sourceMappingURL=monitor.umd.js.map