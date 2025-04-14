export interface IBasicType {
    title: string;
    url: string;
    timestamp: string;
    userAgent: string;
    kind: string;
    type: string;
    errorType: string;
    message: string;
    filename: string;
    position: string;
    stack: string[];
    selector: string;
}
export type BasicType = Partial<IBasicType>;
