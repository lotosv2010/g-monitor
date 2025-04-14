import JSError from './error/index';
import XHR from './xhr';
import Blank from './blank';
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