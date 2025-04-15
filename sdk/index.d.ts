declare module '@aliyun-sls/web-track-browser' {
  class SlsTracker {
    constructor(config: any);
    send(logs: object): void;
  }
  export = SlsTracker;
}

declare global {}

export {}