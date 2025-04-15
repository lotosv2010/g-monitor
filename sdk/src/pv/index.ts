import tracker from '../utils/tracker';
import { Storage } from '../utils/storage';

class PV {
  private storage = Storage.getInstance();
  constructor() {
    this.init();
  }
  private getPv() {
    const navigator = window.navigator as any;
    const connection = navigator.connection;
    const data = {
      kind: 'business',
      type: 'pv',
      connectionType: connection.effectiveType, // 网络类型
      downlink: connection.downlink,
      rtt: connection.rtt, // 往返时间
      screen: `${window.screen.width}x${window.screen.height}`,
    };
    this.storage.setItem(data);
    tracker.send(data);
  }
  private getStayTime() {
    const startTime = Date.now();
    window.addEventListener('unload', () => {
      const stayTime = Date.now() - startTime;
      const data = {
        kind: 'business',
        type: 'stayTime',
        stayTime,
      };
      this.storage.setItem(data);
      tracker.send(data);
    }, false)
  }
  private init() {
    this.getPv();
    this.getStayTime();
  }
}
export default PV;