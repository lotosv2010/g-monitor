import JSError from './error/index';
import { IBasicType, BasicType } from './types/index'

class GMonitor {

  constructor() {
    this.init();
  }

  private init() {
    try {
      new JSError()
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