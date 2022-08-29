function tooltip(bodyElement, iframeElement) {
  const mousePosition = { x: 0, y: 0 };

  const ALIGMENT_LEFT = 60;
  const ALIGMENT_TOP = 30;

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
      top: y < ALIGMENT_TOP ? y : y - ALIGMENT_TOP,
      left: x < ALIGMENT_LEFT ? x + ALIGMENT_LEFT : x - ALIGMENT_LEFT,
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
  const LEFT_ITEM_ID = 'left_tureng_xx';
  const RIGHT_ITEM_ID = 'right_tureng_xx';
  const INPUT_ID = 'input_xx';
  const IFRAME_ID = 'iframe_xx';

  const input = document.createElement('input');
  const newBody = document.createElement('body');
  const right = document.createElement('div');
  const left = document.createElement('div');
  const copyOfBodyElement = document.body.cloneNode(true);
  const iframe = document.createElement('iframe');

  iframe.src = 'https://tureng.com/tr/turkce-ingilizce/hello';
  iframe.id = IFRAME_ID;
  input.id = INPUT_ID;
  left.id = LEFT_ITEM_ID;
  right.id = RIGHT_ITEM_ID;

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

  right.appendChild(iframe);
  newBody.appendChild(input);
  newBody.appendChild(left);
  newBody.appendChild(right);

  Array.from(document.body.childNodes).forEach((item) => item.remove());

  document.body = newBody;

  function getCssContent(turengSize) {
    return `
    body{
      display: flex;
      overflow-y: hidden;
      overflow-x: hidden;
      padding: 20px;
    }
    #${LEFT_ITEM_ID}{
      width: calc(100% - ${turengSize}px); 
      height: calc(95vh - 20px);
      overflow-y: auto;
      overflow-x: auto;
    }

    #${RIGHT_ITEM_ID}
    {
      width: ${turengSize}px;
      height: calc(95vh - 20px);
      overflow-y: hidden;
      overflow-x: hidden;
    }

    #${INPUT_ID}{
      position: absolute;
      top: 5px;
      left: 5px;
      z-index: 99999999;
      width: 33px;
      height: 16px;
      opacity: 0.5;
    }

    #${INPUT_ID}:hover{
      opacity: 1;
    }

    #${IFRAME_ID}{
      width: 100%;
      height: 100%;
    }
  `;
  }

  let removeLoadedStyle = loadCss(getCssContent(window.innerWidth / 2));

  input.onchange = (e) => {
    const newSize = parseInt(e.target.value);
    removeLoadedStyle();
    removeLoadedStyle = loadCss(getCssContent(newSize));
  };

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
$l(() => {
  loadScript(
    'https://raw.githubusercontent.com/yasintz/cdn/master/handle-keyboard-event.js',
    () => {
      keyboardListener(({ t, withAlt, withCtrl }) => {
        if (withCtrl && withAlt && t) {
          TurengIframe();
        }
      });
    }
  );
});
