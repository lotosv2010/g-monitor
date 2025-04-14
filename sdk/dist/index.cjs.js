'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var GPerformance = /** @class */ (function () {
    function GPerformance() {
        this.performance = window.performance;
        // this.init();
        this.init();
    }
    GPerformance.prototype.init = function () {
        var _this = this;
        if (!this.performance)
            return;
        // Move getNavigationTiming inside the load event listener to ensure loadEventEnd is captured correctly
        window.addEventListener("load", function () {
            // Delay the execution slightly to ensure loadEventEnd is captured
            setTimeout(function () {
                _this.getNavigationTiming();
            }, 0);
        });
        this.getResourceTiming();
        this.getPaintTiming();
        this.getLCP();
    };
    // 新版性能指标获取方式
    GPerformance.prototype.getNavigationTiming = function () {
        var navigationEntry = this.performance.getEntriesByType("navigation")[0];
        if (navigationEntry) {
            var metrics = {
                // 关键时间节点
                startTime: navigationEntry.startTime,
                redirectStart: navigationEntry.redirectStart,
                redirectEnd: navigationEntry.redirectEnd,
                domainLookupStart: navigationEntry.domainLookupStart,
                domainLookupEnd: navigationEntry.domainLookupEnd,
                connectStart: navigationEntry.connectStart,
                connectEnd: navigationEntry.connectEnd,
                secureConnectionStart: navigationEntry.secureConnectionStart,
                requestStart: navigationEntry.requestStart,
                responseStart: navigationEntry.responseStart,
                responseEnd: navigationEntry.responseEnd,
                domInteractive: navigationEntry.domInteractive,
                domContentLoadedEventStart: navigationEntry.domContentLoadedEventStart,
                domContentLoadedEventEnd: navigationEntry.domContentLoadedEventEnd,
                domComplete: navigationEntry.domComplete,
                loadEventStart: navigationEntry.loadEventStart,
                loadEventEnd: navigationEntry.loadEventEnd,
                // 计算关键指标
                dnsTime: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
                tcpTime: navigationEntry.connectEnd - navigationEntry.connectStart,
                ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
                fullLoadTime: navigationEntry.loadEventEnd - navigationEntry.startTime,
                domReadyTime: navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
            };
            console.log("Navigation Timing:", metrics);
            return metrics;
        }
    };
    // 资源加载性能
    GPerformance.prototype.getResourceTiming = function () {
        var resources = this.performance.getEntriesByType("resource");
        var resourceMetrics = resources.map(function (resource) { return ({
            name: resource.name,
            duration: resource.duration,
            initiatorType: resource.initiatorType,
            transferSize: resource.transferSize,
            encodedBodySize: resource.encodedBodySize,
            decodedBodySize: resource.decodedBodySize,
            startTime: resource.startTime,
            responseEnd: resource.responseEnd
        }); });
        console.log("Resource Timing:", resourceMetrics);
        return resourceMetrics;
    };
    // 获取 Paint Timing (FP/FCP) using PerformanceObserver
    GPerformance.prototype.getPaintTiming = function () {
        var paintObserver = new PerformanceObserver(function (list) {
            var entries = list.getEntries();
            var firstPaint = entries.find(function (e) { return e.name === "first-paint"; });
            var firstContentfulPaint = entries.find(function (e) { return e.name === "first-contentful-paint"; });
            var result = {
                firstPaint: firstPaint === null || firstPaint === void 0 ? void 0 : firstPaint.startTime,
                firstContentfulPaint: firstContentfulPaint === null || firstContentfulPaint === void 0 ? void 0 : firstContentfulPaint.startTime
            };
            console.log("Paint Timing:", result);
        });
        paintObserver.observe({ type: "paint", buffered: true });
    };
    // 获取 LCP (Largest Contentful Paint) using PerformanceObserver
    GPerformance.prototype.getLCP = function () {
        var lcpObserver = new PerformanceObserver(function (list) {
            var entries = list.getEntries();
            var lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.renderTime || lastEntry.startTime);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    };
    return GPerformance;
}());

exports.GPerformance = GPerformance;
//# sourceMappingURL=index.cjs.js.map
