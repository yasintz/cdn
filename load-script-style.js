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

function loadScript(url, cb, type) {
  const scriptTag = document.createElement('script');
  scriptTag.async = !0;
  scriptTag.charset = 'utf-8';

  if (type === 'src') {
    scriptTag.src = url;
    document.head.appendChild(scriptTag);
    scriptTag.onload = () => {
      if (cb) {
        cb();
      }
    };
    return;
  }
  fetchContent(url, (responseText) => {
    scriptTag.innerHTML = responseText;
    document.head.appendChild(scriptTag);

    setTimeout(() => {
      cb();
    }, 10);
  });
}

function loadCss(urlOrContent) {
  const style = document.createElement('style');

  if (validURL(urlOrContent)) {
    fetchContent(urlOrContent, (responseText) => {
      style.innerHTML = responseText;
      document.head.appendChild(style);
    });
  } else {
    style.innerHTML = urlOrContent;
    document.head.appendChild(style);
  }
}
