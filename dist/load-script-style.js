[loadScript, loadCss] = (() => {
  function validURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return !!pattern.test(str);
  }

  function fetchContent(url, cb) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        cb(this.responseText);
      }
    };
    xhttp.open('GET', url, true);
    xhttp.send();
  }

  const SCRIPT_DATA_ATTRIBUTE = 'data-script-url';

  function hasScript(url) {
    const script = Array.from(document.querySelectorAll('script')).find(
      (item) => item.getAttribute('data-script-url') === url
    );

    return Boolean(script);
  }

  function loadScript(url, cb, type) {
    const _hasScript = hasScript(url);

    if (_hasScript) {
      if (cb) cb();
      return;
    }

    const scriptTag = document.createElement('script');

    function removeScript() {
      scriptTag.remove();
    }

    scriptTag.async = !0;
    scriptTag.charset = 'utf-8';
    scriptTag.setAttribute(SCRIPT_DATA_ATTRIBUTE, url);

    if (type === 'src') {
      scriptTag.src = url;
      document.head.appendChild(scriptTag);
      scriptTag.onload = () => {
        if (cb) cb();
      };
      return;
    }
    fetchContent(url, (responseText) => {
      scriptTag.innerHTML = responseText;
      document.head.appendChild(scriptTag);

      setTimeout(() => {
        if (cb) {
          cb();
        }
      }, 10);
    });

    return removeScript;
  }

  function loadCss(urlOrContent) {
    const style = document.createElement('style');

    function removeStyle() {
      style.remove();
    }

    if (validURL(urlOrContent)) {
      fetchContent(urlOrContent, (responseText) => {
        style.innerHTML = responseText;
        document.head.appendChild(style);
      });
    } else {
      style.innerHTML = urlOrContent;
      document.head.appendChild(style);
    }

    return removeStyle;
  }

  return [loadScript, loadCss];
})();

window.loadScript = loadScript;
window.loadCss = loadCss;
