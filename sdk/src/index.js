import perf from './perf';

// 性能监控
perf.init((perfData) => {
  console.log('perfData', perfData)
});
