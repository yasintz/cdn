const names: Record<string, any> = {};

function syncScroll() {
  const elems = document.getElementsByClassName('syncscroll');

  // clearing existing listeners
  let i, j, el, found, name;
  for (name in names) {
    if (Object.prototype.hasOwnProperty.call(names, name)) {
      for (i = 0; i < names[name].length; i++) {
        names[name][i].removeEventListener('scroll', names[name][i].syn, 0);
      }
    }
  }

  // setting-up the new listeners
  for (i = 0; i < elems.length; ) {
    found = j = 0;
    el = elems[i++];
    name = Array.from(el.classList)
      .find((c) => c.startsWith('syncscroll:'))
      ?.split(':')[1];

    if (!name) {
      // name attribute is not set
      continue;
    }

    // @ts-expect-error defined
    el = el.scroller || el;

    // searching for existing entry in array of names;
    // searching for the element in that entry
    for (; j < (names[name] = names[name] || []).length; ) {
      // @ts-expect-error defined
      found |= names[name][j++] == el;
    }

    if (!found) {
      names[name].push(el);
    }

    el.eX = el.eY = 0;

    (function (el, name) {
      el.addEventListener(
        'scroll',
        (el.syn = function () {
          const elementsByName = names[name];

          let scrollX = el.scrollLeft;
          let scrollY = el.scrollTop;

          const xRate = scrollX / (el['scrollWidth'] - el.clientWidth);
          const yRate = scrollY / (el.scrollHeight - el.clientHeight);

          const updateX = scrollX != el.eX;
          const updateY = scrollY != el.eY;

          let otherEl,
            i = 0;

          el.eX = scrollX;
          el.eY = scrollY;

          for (; i < elementsByName.length; ) {
            otherEl = elementsByName[i++];
            if (otherEl != el) {
              if (
                updateX &&
                Math.round(
                  otherEl.scrollLeft -
                    (scrollX = otherEl.eX =
                      Math.round(
                        xRate * (otherEl.scrollWidth - otherEl.clientWidth)
                      ))
                )
              ) {
                otherEl.scrollLeft = scrollX;
              }

              if (
                updateY &&
                Math.round(
                  otherEl.scrollTop -
                    (scrollY = otherEl.eY =
                      Math.round(
                        yRate * (otherEl.scrollHeight - otherEl.clientHeight)
                      ))
                )
              ) {
                otherEl.scrollTop = scrollY;
              }
            }
          }
        }),
        0
      );
    })(el, name);
  }
}

if (document.readyState == 'complete') {
  syncScroll();
} else {
  // @ts-expect-error defined
  window.addEventListener('load', syncScroll, 0);
}

// @ts-expect-error defined
window.syncscroll = { reset: syncScroll };
