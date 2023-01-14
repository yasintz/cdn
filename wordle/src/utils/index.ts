function toggleFullScreen() {
  if (
    !document.fullscreenElement && // alternative standard method
    // @ts-ignore
    !document.mozFullScreenElement &&
    // @ts-ignore
    !document.webkitFullscreenElement
  ) {
    // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      // @ts-ignore
    } else if (document.documentElement.mozRequestFullScreen) {
      // @ts-ignore
      document.documentElement.mozRequestFullScreen();
      // @ts-ignore
    } else if (document.documentElement.webkitRequestFullscreen) {
      // @ts-ignore
      document.documentElement.webkitRequestFullscreen(
        // @ts-ignore
        Element.ALLOW_KEYBOARD_INPUT
      );
    }
  } else {
    // @ts-ignore
    if (document.cancelFullScreen) {
      // @ts-ignore
      document.cancelFullScreen();
      // @ts-ignore
    } else if (document.mozCancelFullScreen) {
      // @ts-ignore
      document.mozCancelFullScreen();
      // @ts-ignore
    } else if (document.webkitCancelFullScreen) {
      // @ts-ignore
      document.webkitCancelFullScreen();
    }
  }
}

export { toggleFullScreen };
