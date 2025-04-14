declare class GPerformance {
    private performance;
    constructor();
    init(): void;
    private getNavigationTiming;
    private getResourceTiming;
    getPaintTiming(): void;
    private getLCP;
}
export default GPerformance;
