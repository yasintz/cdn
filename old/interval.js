function interval(cb, timeout) {
  const intervalStore = {
    interval: null
  };

  const remove = () => {
    clearInterval(intervalStore.interval);
  };

  intervalStore.interval = setInterval(() => {
    cb(remove);
  }, timeout);
}
