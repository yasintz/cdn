import React, { useMemo } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { getPersonUrl } from '../../helper';
import useId from '../../hooks/use-id';

const StyledPerson = styled.a<{ $highlight?: boolean }>`
  text-decoration: none;
  color: #666;
  ${(props) =>
    props.$highlight ? `background-color: #68cd4f !important;` : ''}
`;

type PersonProps = {
  id: string;
  gender: 0 | 1;
  personName: string;
  className?: string;
  onClick: () => void;
  highlight?: boolean;
};

const genderClass = ['male', 'female'];

const Person: React.FC<PersonProps> = ({
  id,
  personName,
  className,
  gender,
  highlight,
  onClick,
}) => {
  const url = useMemo(() => getPersonUrl(id, window.location.href), [id]);
  return (
    <StyledPerson
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cx(genderClass[gender], className)}
      $highlight={highlight}
      href={url}
    >
      {personName}
    </StyledPerson>
  );
};

export default Person;
