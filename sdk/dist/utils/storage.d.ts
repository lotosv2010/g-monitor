import { BasicType } from '../types/index';
export declare class Storage {
    private key;
    private static instance;
    constructor(key?: string);
    static getInstance(): Storage;
    setItem(value: BasicType): void;
    getItem(): string | null;
    remove(): void;
}
