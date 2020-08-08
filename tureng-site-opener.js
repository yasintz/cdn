const mousePosition = { x: 0, y: 0 };

const ALIGMENT_LEFT = 60;
const ALIGMENT_TOP = 30;
const isMediumPage = window.location.href.indexOf('medium') === 8;

const TURENG_SITE_OPENER_CLASSNAME = 'tureng-site-opener-xxx';
const TurengSiteOpener = document.createElement('a');
TurengSiteOpener.classList.add(TURENG_SITE_OPENER_CLASSNAME);

loadCss(`
.${TURENG_SITE_OPENER_CLASSNAME}{
  background-color: #ddd;
  border: 1px solid #ddd;
  position: absolute;
}
`);

TurengSiteOpener.innerHTML = 'Tureng';
TurengSiteOpener.target = '_blank';

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

  TurengSiteOpener.style.top = (y < ALIGMENT_TOP ? y : y - ALIGMENT_TOP) + 'px';
  if (isMediumPage) {
    TurengSiteOpener.style.top = y + ALIGMENT_TOP + 'px';
  }
  TurengSiteOpener.style.left =
    (x < ALIGMENT_LEFT ? x + 350 : x - ALIGMENT_LEFT) + 'px';
  TurengSiteOpener.href = `https://tureng.com/tr/turkce-ingilizce/${searchText}`;

  return TurengSiteOpener;
}

function onTextSelected(selectedText) {
  const hasMultipleWord = selectedText.split(' ').length > 1;
  if (hasMultipleWord) {
    return;
  }

  document.body.appendChild(buildElement(selectedText));
}

function main() {
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

main();
