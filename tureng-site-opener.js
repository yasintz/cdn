function turengTooltip(onClick) {
  const mousePosition = { x: 0, y: 0 };

  const ALIGMENT_LEFT = 60;
  const ALIGMENT_TOP = 30;
  const isMediumPage = window.location.href.indexOf('medium') === 8;

  let selectedWord = '';

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
  TurengSiteOpener.onclick = () => onClick(selectedWord);

  function getSelectionText() {
    var text = '';
    if (window.getSelection) {
      text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != 'Control') {
      text = document.selection.createRange().text;
    }
    return text;
  }

  function setPosition() {
    const { x, y } = mousePosition;

    TurengSiteOpener.style.top =
      (y < ALIGMENT_TOP ? y : y - ALIGMENT_TOP) + 'px';
    if (isMediumPage) {
      TurengSiteOpener.style.top = y + ALIGMENT_TOP + 'px';
    }
    TurengSiteOpener.style.left =
      (x < ALIGMENT_LEFT ? x + 350 : x - ALIGMENT_LEFT) + 'px';

    return TurengSiteOpener;
  }

  function onTextSelected(selectedText) {
    const hasMultipleWord = selectedText.split(' ').length > 1;
    if (hasMultipleWord) {
      return;
    }

    selectedWord = selectedText;

    document.body.appendChild(setPosition(selectedText));
  }

  window.addEventListener('mouseup', (event) => {
    const isTurengElement = event.target === TurengSiteOpener;
    const selection = getSelectionText().trim();
    if (!isTurengElement && selection) {
      onTextSelected(selection);
    } else {
      if (document.body.contains(TurengSiteOpener) && event.which === 1) {
        setTimeout(
          () => {
            TurengSiteOpener.remove();
          },
          isTurengElement ? 75 : 0
        );
      }
    }
  });

  window.addEventListener('mousemove', (event) => {
    const e = event || window.event;

    Object.assign(mousePosition, {
      x: e.clientX + window.pageXOffset,
      y: e.clientY + window.pageYOffset,
    });
  });
}

function createTurengOpenerListener() {
  loadScript(
    'https://raw.githubusercontent.com/yasintz/cdn/master/handle-keyboard-event.js',
    () => {
      keyboardListener(({ o, withAlt, withCtrl }) => {
        if (withCtrl && withAlt && o) {
          turengTooltip((word) => {
            window.open(`https://tureng.com/tr/turkce-ingilizce/${word}`);
          });
        }
      });
    }
  );
}

function createTurengDispatcherListener() {
  loadScript(
    'https://raw.githubusercontent.com/yasintz/cdn/master/handle-keyboard-event.js',
    () => {
      const EVENT_NAME = 'TURENG_WORD_DISPATCHER';

      keyboardListener(({ t, withAlt, withCtrl }) => {
        if (withCtrl && withAlt && t) {
          loadScript(
            'https://zn-socket.vercel.app/socket.io/socket.io.js',
            () => {
              const socket = io();
              turengTooltip((word) => {
                socket.emit(EVENT_NAME, word);
              });
            }
          );
        }
      });
    }
  );
}

$l(() => {
  const isTurengPage = window.location.href.indexOf('tureng') === 8;

  if (isTurengPage) {
    return;
  }

  createTurengDispatcherListener();
  createTurengOpenerListener();
});
