import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const StyledHiddenWrapper = styled.div`
  top: -99999999999px;
  position: fixed;
  width: 999999px;
  height: 9999999px;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  & > div {
    width: fit-content;
  }
`;

type TreeSizeCalcProps = {
  setSize: (s: { width: number; height: number }) => void;
  deps: any[];
};

const TreeSizeCalc: React.FC<TreeSizeCalcProps> = ({
  children,
  deps,
  setSize,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      const wrapper = wrapperRef.current;

      if (wrapper) {
        const div = wrapper.children[0];
        const ul = div.children[0];
        const li = ul.children[0];

        const width = div.clientWidth + 50;
        const height = li.clientHeight + 50;
        setSize({ width, height });
      }
    },
    // eslint-disable-next-line
    deps
  );

  return (
    <StyledHiddenWrapper className="tree" ref={wrapperRef}>
      <div>
        <ul>
          <li>
            <div className="tree-wrapper">
              <div className="female">Parent</div>
            </div>
            {children}
          </li>
        </ul>
      </div>
    </StyledHiddenWrapper>
  );
};

export default TreeSizeCalc;
