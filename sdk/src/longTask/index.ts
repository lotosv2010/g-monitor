import tracker from '../utils/tracker';
import { Storage } from '../utils/storage';
import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';

class LongTask {
  static storage = Storage.getInstance();

  constructor() {
    this.init();
  }

  private init() {
    // 监听长任务
    new PerformanceObserver(function(entryList, observer) {
      entryList.getEntries().forEach(function(entry) {
        if(entry.duration > 100) {
          const lastEvent = getLastEvent() as Event;
          requestIdleCallback(() => {
            const data = {
              kind: 'experience',
              type: 'longTask',
              eventType: lastEvent?.type,
              startTime: entry?.startTime,// 开始时间
              duration: entry?.duration,// 持续时间
              selector: lastEvent ? getSelector(lastEvent) : ''
            }
            LongTask.storage.setItem(data);
            tracker.send(data);
          })
        }
      });
      observer.disconnect();
    }).observe({ entryTypes: ['longtask'] });

  }
}

export default LongTask;