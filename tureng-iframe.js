function tooltip(bodyElement, iframeElement) {
  const mousePosition = { x: 0, y: 0 };

  const ALIGMENT_LEFT = 60;
  const ALIGMENT_TOP = 30;
  const isMediumPage = window.location.href.indexOf('medium') === 8;

  const TURENG_SITE_OPENER_CLASSNAME = 'tureng-site-opener-xxx';
  const TurengSiteOpener = document.createElement('button');
  TurengSiteOpener.classList.add(TURENG_SITE_OPENER_CLASSNAME);

  loadCss(`
.${TURENG_SITE_OPENER_CLASSNAME}{
  background-color: #ddd;
  border: 1px solid #ddd;
  position: absolute;
}
`);

  TurengSiteOpener.innerHTML = 'Tureng';

  function getSelectionText() {
    var text = '';
    if (window.getSelection) {
      text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != 'Control') {
      text = document.selection.createRange().text;
    }
    return text;
  }

  function buildElement(searchText) {
    const { x, y } = mousePosition;

    const position = {
      top: isMediumPage
        ? y + ALIGMENT_TOP
        : y < ALIGMENT_TOP
        ? y
        : y - ALIGMENT_TOP,
      left: x < ALIGMENT_LEFT ? x + 350 : x - ALIGMENT_LEFT,
    };

    TurengSiteOpener.style.top = position.top + 'px';
    TurengSiteOpener.style.left = position.left + 'px';

    TurengSiteOpener.onclick = () => {
      iframeElement.src = `https://tureng.com/tr/turkce-ingilizce/${searchText}`;
    };

    return TurengSiteOpener;
  }

  function onTextSelected(selectedText) {
    const hasMultipleWord = selectedText.split(' ').length > 1;
    if (hasMultipleWord) {
      return;
    }

    bodyElement.appendChild(buildElement(selectedText));
  }

  bodyElement.addEventListener('mouseup', (event) => {
    const isTurengElement = event.target === TurengSiteOpener;
    const selection = getSelectionText().trim();
    if (!isTurengElement && selection) {
      onTextSelected(selection);
    } else {
      if (bodyElement.contains(TurengSiteOpener) && event.which === 1) {
        setTimeout(
          () => {
            TurengSiteOpener.remove();
          },
          isTurengElement ? 75 : 0
        );
      }
    }
  });

  bodyElement.addEventListener('mousemove', (event) => {
    const e = event || window.event;

    Object.assign(mousePosition, {
      x: e.clientX,
      y: e.clientY,
    });
  });
}

function buildBodyForIframe() {
  const RIGHT_WIDTH = 800;
  const LEFT_ITEM_ID = 'left_tureng_xx';
  const RIGHT_ITEM_ID = 'right_tureng_xx';

  const copyOfBodyElement = document.body.cloneNode(true);
  const left = document.createElement('div');

  while (copyOfBodyElement.firstChild) {
    left.appendChild(copyOfBodyElement.firstChild);
  }
  copyOfBodyElement.childNodes.forEach((item) => {
    left.appendChild(item);
  });

  for (
    let index = copyOfBodyElement.attributes.length - 1;
    index >= 0;
    --index
  ) {
    left.attributes.setNamedItem(
      copyOfBodyElement.attributes[index].cloneNode()
    );
  }

  const newBody = document.createElement('body');

  const right = document.createElement('div');

  const iframe = document.createElement('iframe');
  iframe.src = 'https://tureng.com/tr/turkce-ingilizce/hello';

  loadCss(`
    body{
      display: flex;
      overflow-y: hidden;
      overflow-x: hidden;
      padding: 20px;
    }
    #${LEFT_ITEM_ID}{
      width: calc(100% - ${RIGHT_WIDTH}px); 
      height: 100vh;
      overflow-y: auto;
      overflow-x: auto;
    }

    #${RIGHT_ITEM_ID}
    {
      width: ${RIGHT_WIDTH}px;
      height: 100vh;
      overflow-y: hidden;
      overflow-x: hidden;
    }
    iframe{
      width: 100%;
      height: 100%;
    }
  `);

  right.appendChild(iframe);

  left.id = LEFT_ITEM_ID;
  right.id = RIGHT_ITEM_ID;
  newBody.appendChild(left);
  newBody.appendChild(right);

  Array.from(document.body.childNodes).forEach((item) => item.remove());

  document.body = newBody;

  return { iframe, newBody: left };
}

function TurengIframe() {
  function main() {
    const { iframe, newBody } = buildBodyForIframe();
    tooltip(newBody, iframe);
  }
  if (typeof $ === 'undefined') {
    loadScript('https://code.jquery.com/jquery-3.5.1.min.js', main);
  } else {
    main();
  }
}
