import { Storage } from '../utils/storage';
declare class Timing {
    static storage: Storage;
    constructor();
    private getLoadTime;
    private getPerformanceIndicators;
    private init;
}
export default Timing;
