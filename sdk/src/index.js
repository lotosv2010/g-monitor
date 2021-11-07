import perf from './perf';
import resources from './resources'

// 性能监控
perf.init((perfData) => {
  console.log('perfData', perfData)
});

// 资源监控
resources.init((resourcesData) => {
  console.log('resourcesData', resourcesData)
});
