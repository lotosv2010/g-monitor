import perf from './perf';
import resources from './resources';
import xhr from './xhr';

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
})