import { useState } from 'react';
import styled from 'styled-components';
import dayjs from '../utils/dayjs';
import { TimezoneItemType } from './helpers';
import { TimezoneDropdown } from './timezone-dropdown';

type AddTimezoneProps = {
  timezones: TimezoneItemType[];
  dateByTimePercentage: dayjs.Dayjs;
  onCreate: (title: string, timezone: TimezoneItemType) => void;
};

export const AddTimezone = ({
  dateByTimePercentage,
  timezones,
  onCreate,
}: AddTimezoneProps) => {
  const [timezone, setTimezone] = useState<TimezoneItemType>();
  const [title, setTitle] = useState('');
  return (
    <StyledContainer>
      <StyledTitleInput
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TimezoneDropdown
        timezones={timezones}
        dateByTimePercentage={dateByTimePercentage}
        selectedValue={timezone}
        onChange={setTimezone}
      />
      <button onClick={() => title && timezone && onCreate(title, timezone)}>
        Add
      </button>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding: 4px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ddd;
  margin-bottom: 12px;
`;

const StyledTitleInput = styled.input`
  margin-bottom: 4px;
  height: 24px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  &:focus {
    outline: none;
  }
`;
