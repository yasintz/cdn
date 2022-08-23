import React, { useEffect, useRef, useState } from 'react';
import styled, { CSSProperties } from 'styled-components';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { useClickOutside } from '../hooks/useClickOutside';

const DROPDOWN_HEIGH = 500;

// #region Helper
function getX(target: HTMLElement) {
  const targetRect = target.getBoundingClientRect();
  const documentWidth = document.documentElement.getBoundingClientRect().width;
  const pickerWidth = targetRect.width;
  const rightSpaceIsAvailable =
    documentWidth - (targetRect.left + pickerWidth) > 0;

  return rightSpaceIsAvailable
    ? targetRect.left
    : documentWidth - (pickerWidth + 16);
}

function getY(target: HTMLElement) {
  const targetRect = target.getBoundingClientRect();
  return targetRect.bottom + 8;
}

const getFixedStyle = (
  ref?: React.MutableRefObject<HTMLElement | null>
): CSSProperties => {
  if (!ref?.current) {
    return {};
  }
  const targetRect = ref.current.getBoundingClientRect();

  return {
    top: `${getY(ref.current)}px`,
    left: `${getX(ref.current)}px`,
    width: `${targetRect.width}px`,
    right: undefined,
    position: 'fixed',
  };
};
// #endregion

export type DropdownItemType = {
  label: string;
  value: string;
};

type Props = {
  className?: string;
  options: DropdownItemType[];
  onClose: () => void;
  onSelect: (item: DropdownItemType) => void;
  targetRef?: React.MutableRefObject<HTMLElement | null>;
};

const Dropdown: React.FunctionComponent<Props> = ({
  className,
  options,
  onClose,
  onSelect,
  targetRef,
}) => {
  const popupMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  useClickOutside({ ref: popupMenuRef, action: onClose });

  const fixedStyle = getFixedStyle(targetRef);

  useEffect(() => {
    const listener = _.throttle((event: Event) => {
      if (!targetRef?.current) {
        return;
      }
      const scrolledElement = event.target as HTMLElement;
      const isChild = scrolledElement.contains(targetRef.current);
      if (isChild) {
        onClose();
      }
    }, 50);

    document.addEventListener('scroll', listener, true);
    return () => {
      document.removeEventListener('scroll', listener, true);
    };
  }, [onClose, targetRef]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return ReactDOM.createPortal(
    <StyledPopupMenu
      ref={popupMenuRef}
      className={className}
      $style={fixedStyle}
    >
      <StyledInnerContainer>
        <StyledInputContainer>
          <input
            ref={inputRef}
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </StyledInputContainer>
        {options
          .filter(
            (option) =>
              !search ||
              option.label.toLowerCase().indexOf(search.toLowerCase()) > -1
          )
          .map((option) => (
            <StyledButton
              key={option.value}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(option);
                onClose();
              }}
            >
              <StyledMenuItemText>{option.label}</StyledMenuItemText>
            </StyledButton>
          ))}
      </StyledInnerContainer>
    </StyledPopupMenu>,
    document.body
  );
};

export default Dropdown;

// #region Styled
const arrowRight = 24;
const arrowSize = 7;
const StyledPopupMenu = styled.div<{ $style?: CSSProperties }>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  zIndex: 100,
  borderRadius: 8,
  backgroundColor: '#FFFFFF',
  boxShadow: '0px -2px 12px 0px #0000002F',
  overflowY: 'auto',
  height: DROPDOWN_HEIGH,
  ...props.$style,
  '::before': {
    border: `${arrowSize}px solid black`,
    content: "' '",
    position: 'absolute',
    zIndex: 1,
    bottom: '100%',
    right: arrowRight,
    marginLeft: 0,
    borderColor: 'transparent transparent #fff transparent',
  },
}));

const StyledInnerContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledButton = styled.div({
  display: 'flex',
  alignItems: 'center',
  width: 'calc(100% - 12px)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  padding: '4px 6px',
  textDecoration: 'none',
  '&:hover': {
    backgroundColor: '#ddd',
  },
});

const StyledMenuItemText = styled.p({
  fontSize: 12,
});

const StyledInputContainer = styled.div`
  display: flex;
  position: sticky;
  top: 0px;
  padding: 8px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  input {
    flex: 1;
    border: none;
    height: 16px;
    &:focus {
      outline: none;
    }
  }
`;
// #endregion
