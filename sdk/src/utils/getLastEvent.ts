let lastEvent: Event | null = null;
['click', 'touchstart', 'mousedown', 'mouseover', 'keydown'].map(event => {
  document.addEventListener(event, function(e) {
    lastEvent = e;
  }, {
    capture: true, // 捕获阶段
    passive: true  // 默认为false，表示事件处理函数可以阻止默认事件，如果设置为true，则表示事件处理函数不可以阻止默认事件
  })
})

export default function getLastEvent() {
  return lastEvent;
}