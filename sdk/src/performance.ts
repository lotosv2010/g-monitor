class GPerformance {
  private performance: Performance = window.performance;
  
  constructor() {
    // this.init();
    this.init();
  }

  init() {
    if (!this.performance) return;
    // Move getNavigationTiming inside the load event listener to ensure loadEventEnd is captured correctly
    window.addEventListener("load", () => {
      // Delay the execution slightly to ensure loadEventEnd is captured
      setTimeout(() => {
        this.getNavigationTiming();
      }, 0);
    });
    this.getResourceTiming();
    this.getPaintTiming();
    this.getLCP();
  }

  // 新版性能指标获取方式
  private getNavigationTiming() {
    const [navigationEntry] = this.performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];

    if (navigationEntry) {
      const metrics = {
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
  }

  // 资源加载性能
  private getResourceTiming() {
    const resources = this.performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];

    const resourceMetrics = resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      initiatorType: resource.initiatorType,
      transferSize: resource.transferSize,
      encodedBodySize: resource.encodedBodySize,
      decodedBodySize: resource.decodedBodySize,
      startTime: resource.startTime,
      responseEnd: resource.responseEnd
    }));

    console.log("Resource Timing:", resourceMetrics);
    return resourceMetrics;
  }

  // 获取 Paint Timing (FP/FCP) using PerformanceObserver
  getPaintTiming() {
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstPaint = entries.find(e => e.name === "first-paint");
      const firstContentfulPaint = entries.find(e => e.name === "first-contentful-paint");
      const result = {
        firstPaint: firstPaint?.startTime,
        firstContentfulPaint: firstContentfulPaint?.startTime
      };
      console.log("Paint Timing:", result);
    });
    paintObserver.observe({ type: "paint", buffered: true });
  }

  // 获取 LCP (Largest Contentful Paint) using PerformanceObserver
  private getLCP() {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry: any = entries[entries.length - 1];
      console.log('LCP:', lastEntry.renderTime || lastEntry.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  }
}

export default GPerformance;