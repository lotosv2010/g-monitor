import { BasicType } from '../types/index'
export class Storage {
  private key = '';
  private static instance: Storage;
  constructor(key: string = 'g-monitor-error') {
    // 初始化
    this.key = key;
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new Storage();
    }
    return this.instance;
  }
  setItem(value: BasicType) {
    const prev = localStorage.getItem(this.key);
    if(prev) {
      const prevData = JSON.parse(prev);
      localStorage.setItem(this.key, JSON.stringify([...prevData, value]));
    } else {
      localStorage.setItem(this.key, JSON.stringify([value]));
    }
  }
  getItem() {
    return localStorage.getItem(this.key);
  }
  remove() {
    localStorage.removeItem(this.key);
  }
}