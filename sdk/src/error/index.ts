import { BasicType } from '../types/index';
import { Storage } from '../utils/storage';
import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';
import tracker from '../utils/tracker';

class JSError {
  private storage: Storage = Storage.getInstance();
  constructor() {
    this.init();
  }
  private formatStack(stack: string = '') {
    // 将 stack 转换成一个数组
    return stack.split('\n').slice(1).map((item) => {
      return item.replace(/^\s+at\s+/g, '');
    });
  }
  private init() {
    window.addEventListener('error', (e) => {
      console.log(e);
      const lastEvent: any = getLastEvent();
      const target: any = e.target;
      if (target && (target.src || target.href)) {
        const error: any = {
          kind: 'stability',//稳定性指标
          type: 'resource-error',//resource
          errorType: e.type,
          filename: target.src || target.href,//加载失败的资源
          tagName: target.tagName,//标签名
          timeStamp: e.timeStamp,//时间
          selector: getSelector(e),//选择器
        }
        this.storage.setItem(error);
        tracker.send(error);
    } 
      const error: BasicType = {
        title: document.title,
        url: window.location.href,
        timestamp: `${e.timeStamp}`,
        userAgent: navigator.userAgent,
        kind: 'stability',
        type: 'js-error',
        errorType: e.type,
        message: e.message,
        filename: e.filename,
        position: `${e.lineno}:${e.colno}`,
        stack: this.formatStack(e.error.stack),
        selector: lastEvent ? getSelector(lastEvent) : ''
      }
      // 存储到本地，测试用
      this.storage.setItem(error);
      tracker.send(error);
    });
    window.addEventListener('unhandledrejection', (e) => {
      const lastEvent: any = getLastEvent();
      let message = '';
      let stack: string[] = [];
      let lineno = ''
      let colno = '';
      let filename = '';
      const reason = e.reason;
      if (typeof reason === 'string') {
        message = reason;
      } else if (typeof reason === 'object') {
        message = reason.message;
        if (reason.stack) {
          var matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
          if (matchResult) {
              filename = matchResult[1];
              lineno = matchResult[2];
              colno = matchResult[3];
          }
          stack = this.formatStack(reason.stack);
        }

      }
      const error: BasicType = {
        title: document.title,
        url: window.location.href,
        timestamp: `${e.timeStamp}`,
        userAgent: navigator.userAgent,
        kind: 'stability',
        type: 'promise-error',
        errorType: e.type,
        message,
        filename,
        position: `${lineno}:${colno}`,
        stack,
        selector: lastEvent? getSelector(lastEvent) : ''
      }
      this.storage.setItem(error);
      tracker.send(error);
    });
  }
}

export default JSError;