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
        });
      } else {
        // 在onload之后获取所有的资源新
        onload(() => {
          let entries = performance.getEntriesByType('resource');
          cb(resolveEntries(entries));
        });
      }
    },
  };

  let xhrHook = {
    init: (cb) => {
      // xhr hook
      let xhr = window.XMLHttpRequest;
      if (xhr._xhr_flag === true) {
        return void 0;
      }
      xhr._xhr_flag = true;

      let _originOpen = xhr.prototype.open;
      xhr.prototype.open = function (method, url, async, user, password) {
        // TODO eagle url check
        this._xhr_info = {
          url: url,
          method: method,
          status: null
        };
        return _originOpen.apply(this, arguments);
      };

      let _originSend = xhr.prototype.send;
      xhr.prototype.send = function (value) {
        let _self = this;
        this._start_time = Date.now();

        let ajaxEnd = (event) => () => {
          if (_self.response) {
            let responseSize = null;
            switch(_self.responseType) {
              case 'json':
                responseSize = JSON && JSON.stringify(_this.response).length;
                break;
              case 'blob':
              case 'moz-blob':
                responseSize = _self.response.size;
                break;
              case 'arraybuffer':
                responseSize = _self.response.byteLength;
              case 'document':
                responseSize = _self.response.documentElement && _self.response.documentElement.innerHTML && (_self.response.documentElement.innerHTML.length + 28);
                break;
              default:
                responseSize = _self.response.length;
            }
            _self._xhr_info.event = event;
            _self._xhr_info.status = _self.status;
            _self._xhr_info.success = (_self.status >= 200 && _self.status <= 206) || _self.status === 304;
            _self._xhr_info.duration = Date.now() - _self._start_time;
            _self._xhr_info.responseSize = responseSize;
            _self._xhr_info.requestSize = value ? value.length : 0;
            _self._xhr_info.type = 'xhr';
            cb(this._xhr_info);
          }
        };

        // TODO eagle url check
        if (this.addEventListener) {
          // 这三种状态都代表请求已经结束了，需要统计一些信息，并上报上去
          this.addEventListener('load', ajaxEnd('load'), false);
          this.addEventListener('error', ajaxEnd('error'), false);
          this.addEventListener('abort', ajaxEnd('abort'), false);
        } else {
          let _origin_onreadystatechange = this.onreadystatechange;
          this.onreadystatechange = function (event) {
            if (_origin_onreadystatechange) {
              _originOpen.apply(this, arguments);
            }
            if (this.readyState === 4) {
              ajaxEnd('end')();
            }
          };
        }
        return _originSend.apply(this, arguments);
      };

      // fetch hook
      if (window.fetch) {
        let _origin_fetch = window.fetch;
        window.fetch = function () {
          let startTime = Date.now();
          let args = [].slice.call(arguments);

          let fetchInput = args[0];
          let method = 'GET';
          let url;

          if (typeof fetchInput === 'string') {
            url = fetchInput;
          } else if ('Request' in window && fetchInput instanceof window.Request) {
            url = fetchInput.url;
            if (fetchInput.method) {
              method = fetchInput.method;
            }
          } else {
            url = '' + fetchInput;
          }

          if (args[1] && args[1].method) {
            method = args[1].method;
          }

          // TODO eagle check
          let fetchData = {
            method: method,
            url: url,
            status: null,
          };

          return _origin_fetch.apply(this, args).then(function(response) {
            fetchData.status = response.status;
            fetchData.type = 'fetch';
            fetchData.duration = Date.now() - startTime;
            cb(fetchData);
            return response;
          });
        };
      }
    }
  };

  let formatError = (errObj) => {
    let col = errObj.column || errObj.columnNumber; // Safari Firefox
    let row = errObj.line || errObj.lineNumber; // Safari Firefox
    let message = errObj.message;
    let name = errObj.name;

    let {stack} = errObj;
    if (stack) {
      let matchUrl = stack.match(/https?:\/\/[^\n]+/);
      // urlFirstStack 包含报错的url和位置
      let urlFirstStack = matchUrl ? matchUrl[0] : '';

      // 获取真正的URL
      let resourceUrl = '';
      let regUrlCheck = /https?:\/\/(\S)*\.js/;
      if (regUrlCheck.test(urlFirstStack)) {
        resourceUrl = urlFirstStack.match(regUrlCheck)[0];
      }

      // 获取真正的行列信息
      let stackCol = null;
      let stackRow = null;
      let posStack = urlFirstStack.match(/:(\d+):(\d+)/);
      if (posStack && posStack.length >= 3) {
        [, stackCol, stackRow] = posStack;
      }

      // TODO formatStack
      return {
        content: stack,
        col: Number(col || stackCol),
        row: Number(row || stackRow),
        message, name, resourceUrl
      };
    }

    return {
      row, col, message, name
    }
  };

  let errorCatch = {
    init: (cb) => {
      let _originOnerror = window.onerror;
      window.onerror = (...arg) => {
        let [errorMessage, scriptURI, lineNumber, columnNumber, errorObj] = arg;
        // console.log(arg, 'cuowu');
        let errorInfo = formatError(errorObj);
        errorInfo._errorMessage = errorMessage;
        errorInfo._scriptURI = scriptURI;
        errorInfo._lineNumber = lineNumber;
        errorInfo._columnNumber = columnNumber;
        errorInfo.type = 'onerror';
        cb(errorInfo);
        _originOnerror && _originOnerror.apply(window, arg);
      };
      let _originOnunhandledrejection = window.onunhandledrejection;
      window.onunhandledrejection = (...arg) => {
        let e = arg[0];
        let reason = e.reason;
        cb({
          type: e.type || 'unhandledrejection',
          reason
        });
        _originOnunhandledrejection && _originOnunhandledrejection.apply(window, arg);
      };
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

  // 接口性能监控
  xhrHook.init((xhrData) => {
    console.log('xhrData', xhrData);
  });

  // 错误监控
  errorCatch.init((errorData) => {
    console.log('errorData', errorData);
  });

}));
//# sourceMappingURL=monitor.umd.js.map
