function selectionTooltip({ content, onClick, isShown }) {
  const mousePosition = { x: 0, y: 0 };

  const ALIGMENT_LEFT = 65;
  const ALIGMENT_TOP = 35;
  const isMediumPage = window.location.href.indexOf('medium') === 8;

  let selectedWord = '';

  const SELECTION_TOOLTIP_CLASSNAME = 'selection-tooltip-xx';
  const selectionTooltipElement = document.createElement('div');
  selectionTooltipElement.classList.add(SELECTION_TOOLTIP_CLASSNAME);

  loadCss(`
      .${SELECTION_TOOLTIP_CLASSNAME}{
        position: absolute;
        background-color: #ddd;
        border: 1px solid #000;
        border-radius: 8px;
        padding: 2.5px;
        cursor: pointer;
      }
      .${SELECTION_TOOLTIP_CLASSNAME}:active{
        background-color: #767676;
        color: white;
      }
    `);

  selectionTooltipElement.innerHTML = content;
  selectionTooltipElement.onclick = () => onClick(selectedWord);

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

    selectionTooltipElement.style.top =
      (y < ALIGMENT_TOP ? y : y - ALIGMENT_TOP) + 'px';
    if (isMediumPage) {
      selectionTooltipElement.style.top = y + ALIGMENT_TOP + 'px';
    }
    selectionTooltipElement.style.left =
      (x < ALIGMENT_LEFT ? x + 350 : x - ALIGMENT_LEFT) + 'px';

    return selectionTooltipElement;
  }

  function onTextSelected(selectedText) {
    const isResume = isShown ? isShown(selectedText) : true;
    if (!isResume) {
      return;
    }
    selectedWord = selectedText;

    document.body.appendChild(setPosition(selectedText));
  }

  window.addEventListener('mouseup', (event) => {
    const isSelf = event.target === selectionTooltipElement;
    const selection = getSelectionText().trim();
    if (!isSelf && selection) {
      onTextSelected(selection);
    } else {
      if (
        document.body.contains(selectionTooltipElement) &&
        event.which === 1
      ) {
        setTimeout(
          () => {
            selectionTooltipElement.remove();
          },
          isSelf ? 75 : 0
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

/* 
  selectionTooltip({
    content: 'Tureng',
    onClick: (searchText) => {},
    isShown: (selectedText) => selectedText.split(' ').length === 1,
  });
   */
