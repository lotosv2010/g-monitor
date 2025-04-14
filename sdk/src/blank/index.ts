import tracker from '../utils/tracker';
import { Storage } from '../utils/storage';
import onload from '../utils/onload';

const getSelector = function (element: Element) {
  let selector = element.nodeName.toLowerCase();
  if (element.id) {
    selector = `#${element.id}`;
  } else if (element.className && typeof element.className === 'string') {
    selector = '.' + element.className.split(' ').filter((item: any) => { return !!item }).join('.');
  }
  return selector;
}

class Blank {
  static storage = Storage.getInstance();
  constructor() {
    this.init();
  }

  private init() {
    const wrapperSelectors = ['body', 'html', '#container', '.content', '.root'];
    let emptyPoints = 0;
    function isWrapper(element: Element) {
      const selector = getSelector(element);
      if (wrapperSelectors.indexOf(selector) >= 0) {
        emptyPoints++;
      }
    }

    onload(function() {
      let xElements, yElements;
      for (let i = 1; i <= 9; i++) {
        // 获取当前页面的元素
        xElements = document.elementsFromPoint(window.innerWidth * i / 10, window.innerHeight / 2)
        yElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight * i / 10)
        isWrapper(xElements[0]);
        isWrapper(yElements[0]);
      }
      if (emptyPoints >= 16) {
        const centerElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
        const data = {
          kind: 'stability',
          type: 'blank',
          emptyPoints: emptyPoints,
          screen: window.screen.width + "x" + window.screen.height,
          viewPoint: window.innerWidth +'x' + window.innerHeight,
          selector: getSelector(centerElements[0]),
        }
        Blank.storage.setItem(data);
        tracker.send(data)
      }
    })
  }
}

export default Blank;