import tracker from '../utils/tracker';
import { Storage } from '../utils/storage';

class XHR {
  static storage: Storage = Storage.getInstance();
  constructor() {
    this.init();
  }
  private init() {
    const XMLHttpRequest = window.XMLHttpRequest;
    const oldOpen: any = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest,
      method: string,
      url: string,
      async: boolean,
      username?: string | null,
      password?: string | null
    ) {
      if (!url.match(/logstores/) && !url.match(/sockjs/)) {
        (this as any).logData = {
          method,
          url,
          async,
          username,
          password,
        };
      }
      return oldOpen.call(this, method, url, async, username, password);
    } as any;
    const oldSend: any = XMLHttpRequest.prototype.send;
    let start: any;
    XMLHttpRequest.prototype.send = function (body) {
      if ((this as any).logData) {
        start = Date.now();
        let handler = (type: any) => (event: any) => {
          let duration = Date.now() - start;
          let status = this.status;
          let statusText = this.statusText;
          const data = {
            kind: "stability",
            type: "xhr",
            eventType: type,
            pathname: (this as any).logData.url,
            status,
            statusText,
            duration: "" + duration,
            response: this.response ? JSON.stringify(this.response) : "",
            params: body || "",
          };
          XHR.storage.setItem(data);
          tracker.send(data);
        };
        this.addEventListener("load", handler("load"), false);
        this.addEventListener("error", handler("error"), false);
        this.addEventListener("abort", handler("abort"), false);
      }
      oldSend.call(this, body);
    };
  }
}

export default XHR;
