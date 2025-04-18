import JSError from './error/index';
import XHR from './xhr';
import Blank from './blank';
import Timing from './timing';
import LongTask from './longTask';
import PV from './pv';
import { IBasicType, BasicType } from './types/index'

class GMonitor {

  constructor() {
    this.init();
  }

  private init() {
    try {
      new JSError();
      new XHR();
      new Blank();
      new Timing();
      new LongTask();
      new PV();
    } catch (error) {
      console.error('GMonitor initialization failed:', error);
    }
  }
}

export {
  BasicType,
  IBasicType,
}
export default GMonitor;