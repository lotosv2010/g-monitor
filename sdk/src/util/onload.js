export let noop = () => {};
export let onload = (cb) => {
  if (document.readyState === 'complete') {
    cb();
    return;
  }
  window.addEventListener('load', cb);
};

export default {
  noop,
  onload
};
