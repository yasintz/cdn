function interval(cb, timeout) {
  const intervalStore = {
    interval: null
  };

  const clearInterval = () => {
    clearInterval(intervalStore.interval);
  };

  intervalStore.interval = setInterval(() => {
    cb(clearInterval);
  }, timeout);
}
