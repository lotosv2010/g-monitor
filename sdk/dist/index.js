import SlsTracker from '@aliyun-sls/web-track-browser';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var Storage = /** @class */ (function () {
    function Storage(key) {
        if (key === void 0) { key = 'g-monitor-error'; }
        this.key = '';
        // 初始化
        this.key = key;
    }
    Storage.getInstance = function () {
        if (!this.instance) {
            this.instance = new Storage();
        }
        return this.instance;
    };
    Storage.prototype.setItem = function (value) {
        var prev = localStorage.getItem(this.key);
        if (prev) {
            var prevData = JSON.parse(prev);
            localStorage.setItem(this.key, JSON.stringify(__spreadArray(__spreadArray([], prevData, true), [value], false)));
        }
        else {
            localStorage.setItem(this.key, JSON.stringify([value]));
        }
    };
    Storage.prototype.getItem = function () {
        return localStorage.getItem(this.key);
    };
    Storage.prototype.remove = function () {
        localStorage.removeItem(this.key);
    };
    return Storage;
}());

var lastEvent = null;
['click', 'touchstart', 'mousedown', 'mouseover', 'keydown'].map(function (event) {
    document.addEventListener(event, function (e) {
        lastEvent = e;
    }, {
        capture: true,
        passive: true // 默认为false，表示事件处理函数可以阻止默认事件，如果设置为true，则表示事件处理函数不可以阻止默认事件
    });
});
function getLastEvent() {
    return lastEvent;
}

var getSelector = function (path) {
    return path.reverse().filter(function (element) {
        return element !== window && element !== document;
    }).map(function (element) {
        var selector = element.nodeName.toLowerCase();
        if (element.id) {
            selector += "#".concat(element.id);
        }
        else if (element.className && typeof element.className === 'string') {
            selector += '.' + element.className.split(' ').filter(function (item) { return !!item; }).join('.');
        }
        return selector;
    }).join('-->');
};
function getSelector$1 (event) {
    var paths = event.path || (event.composedPath && event.composedPath());
    if (Array.isArray(paths) && paths.length) {
        return getSelector(paths);
    }
    else {
        var res = [];
        var element = event.target;
        while (element) {
            res.push(element);
            element = element.parentNode;
        }
        return getSelector(res);
    }
}

var host = "cn-hangzhou.log.aliyuncs.com";
var project = "g-monitor";
var logstore = "g-monitor-store";
function getExtraData() {
    return {
        title: document.title,
        url: location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
    };
}
var SendTracker = /** @class */ (function () {
    function SendTracker() {
        this.opts = {
            host: host,
            project: project,
            logstore: logstore,
            time: 10,
            count: 10,
            topic: 'topic',
            source: 'source',
            tags: {},
        };
        this.tracker = new SlsTracker(this.opts); // 创建SlsTracker对象
    }
    SendTracker.prototype.send = function (data, callback) {
        if (data === void 0) { data = {}; }
        var extraData = getExtraData();
        var logs = __assign(__assign({}, extraData), data);
        // console.log(logs);
        // console.log(JSON.stringify(logs, null, 2));
        this.tracker.send(logs);
    };
    return SendTracker;
}());
var tracker = new SendTracker();

var JSError = /** @class */ (function () {
    function JSError() {
        this.storage = Storage.getInstance();
        this.init();
    }
    JSError.prototype.formatStack = function (stack) {
        if (stack === void 0) { stack = ''; }
        // 将 stack 转换成一个数组
        return stack.split('\n').slice(1).map(function (item) {
            return item.replace(/^\s+at\s+/g, '');
        });
    };
    JSError.prototype.init = function () {
        var _this = this;
        window.addEventListener('error', function (e) {
            console.log(e);
            var lastEvent = getLastEvent();
            var target = e.target;
            if (target && (target.src || target.href)) {
                var error_1 = {
                    kind: 'stability',
                    type: 'resource-error',
                    errorType: e.type,
                    filename: target.src || target.href,
                    tagName: target.tagName,
                    timeStamp: e.timeStamp,
                    selector: getSelector$1(e), //选择器
                };
                _this.storage.setItem(error_1);
                tracker.send(error_1);
            }
            var error = {
                title: document.title,
                url: window.location.href,
                timestamp: "".concat(e.timeStamp),
                userAgent: navigator.userAgent,
                kind: 'stability',
                type: 'js-error',
                errorType: e.type,
                message: e.message,
                filename: e.filename,
                position: "".concat(e.lineno, ":").concat(e.colno),
                stack: _this.formatStack(e.error.stack),
                selector: lastEvent ? getSelector$1(lastEvent) : ''
            };
            // 存储到本地，测试用
            _this.storage.setItem(error);
            tracker.send(error);
        });
        window.addEventListener('unhandledrejection', function (e) {
            var lastEvent = getLastEvent();
            var message = '';
            var stack = [];
            var lineno = '';
            var colno = '';
            var filename = '';
            var reason = e.reason;
            if (typeof reason === 'string') {
                message = reason;
            }
            else if (typeof reason === 'object') {
                message = reason.message;
                if (reason.stack) {
                    var matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
                    if (matchResult) {
                        filename = matchResult[1];
                        lineno = matchResult[2];
                        colno = matchResult[3];
                    }
                    stack = _this.formatStack(reason.stack);
                }
            }
            var error = {
                title: document.title,
                url: window.location.href,
                timestamp: "".concat(e.timeStamp),
                userAgent: navigator.userAgent,
                kind: 'stability',
                type: 'promise-error',
                errorType: e.type,
                message: message,
                filename: filename,
                position: "".concat(lineno, ":").concat(colno),
                stack: stack,
                selector: lastEvent ? getSelector$1(lastEvent) : ''
            };
            _this.storage.setItem(error);
            tracker.send(error);
        });
    };
    return JSError;
}());

var XHR = /** @class */ (function () {
    function XHR() {
        this.init();
    }
    XHR.prototype.init = function () {
        var XMLHttpRequest = window.XMLHttpRequest;
        var oldOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
            if (!url.match(/logstores/) && !url.match(/sockjs/)) {
                this.logData = {
                    method: method,
                    url: url,
                    async: async,
                    username: username,
                    password: password,
                };
            }
            return oldOpen.call(this, method, url, async, username, password);
        };
        var oldSend = XMLHttpRequest.prototype.send;
        var start;
        XMLHttpRequest.prototype.send = function (body) {
            var _this = this;
            if (this.logData) {
                start = Date.now();
                var handler = function (type) { return function (event) {
                    var duration = Date.now() - start;
                    var status = _this.status;
                    var statusText = _this.statusText;
                    var data = {
                        kind: "stability",
                        type: "xhr",
                        eventType: type,
                        pathname: _this.logData.url,
                        status: status,
                        statusText: statusText,
                        duration: "" + duration,
                        response: _this.response ? JSON.stringify(_this.response) : "",
                        params: body || "",
                    };
                    XHR.storage.setItem(data);
                    tracker.send(data);
                }; };
                this.addEventListener("load", handler("load"), false);
                this.addEventListener("error", handler("error"), false);
                this.addEventListener("abort", handler("abort"), false);
            }
            oldSend.call(this, body);
        };
    };
    XHR.storage = Storage.getInstance();
    return XHR;
}());

var GMonitor = /** @class */ (function () {
    function GMonitor() {
        this.init();
    }
    GMonitor.prototype.init = function () {
        try {
            new JSError();
            new XHR();
        }
        catch (error) {
            console.error('GMonitor initialization failed:', error);
        }
    };
    return GMonitor;
}());

export { GMonitor as default };
//# sourceMappingURL=index.js.map
