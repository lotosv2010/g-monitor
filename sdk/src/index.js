import perf from './perf';
import resources from './resources';
import xhr from './xhr';
import errorCatch from './error-catch';
import behavior from './behavior';

// 性能监控
perf.init((perfData) => {
  console.log('perfData', perfData)
});

// 资源监控
resources.init((resourcesData) => {
  console.log('resourcesData', resourcesData)
});

// 接口性能监控
xhr.init((xhrData) => {
  console.log('xhrData', xhrData)
});

// 错误监控
errorCatch.init((errorData) => {
  console.log('errorData', errorData)
});

// 用户行为路径监控
behavior.init(() => {
  console.log('behavior init')
});
