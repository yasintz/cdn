import React from 'react';

export const SKIP_CLICK_OUTSIDE_CHECK_ID = 'skip-click-outside-check';

type Input = {
  ref: React.MutableRefObject<any>;
  action?: () => void;
  disable?: boolean;
};

export const useClickOutside = ({ ref, action, disable }: Input): void => {
  React.useEffect(() => {
    // Handle mouse click
    const listener = (event: MouseEvent) => {
      // If inside, return
      if (!action || !ref.current || ref.current.contains(event.target)) {
        return;
      }

      const isChildOfSkippedElement = (event.target as HTMLElement).closest(
        `#${SKIP_CLICK_OUTSIDE_CHECK_ID}`
      );
      if (
        // @ts-ignore check skip check
        event?.target?.id?.includes(SKIP_CLICK_OUTSIDE_CHECK_ID) ||
        isChildOfSkippedElement
      ) {
        return;
      }

      // If click outside
      action();
    };

    // Click listener
    if (!disable) {
      document.addEventListener('mousedown', listener);
    }

    return () => {
      if (!disable) {
        document.removeEventListener('mousedown', listener);
      }
    };
  }, [ref, action, disable]);
};
