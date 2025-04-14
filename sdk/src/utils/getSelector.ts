const getSelector = function (path: any[]) {
  return path.reverse().filter(function (element) {
    return element !== window && element !== document;
  }).map(function (element) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += `#${element.id}`;
    } else if (element.className && typeof element.className === 'string') {
      selector += '.' + element.className.split(' ').filter(function (item: any) { return !!item }).join('.');
    }
    return selector;
  }).join('-->');
}
export default function (event: any) {
  const paths = event.path || (event.composedPath && event.composedPath());

  if (Array.isArray(paths) && paths.length) {
    return getSelector(paths);
  } else {
    var res = [];
    var element = event.target;
    while (element) {
      res.push(element);
      element = element.parentNode;
    }
    return getSelector(res);
  }
}