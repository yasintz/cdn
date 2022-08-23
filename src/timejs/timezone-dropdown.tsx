import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import Dropdown from '../components/dropdown';
import dayjs from '../utils/dayjs';
import { TimezoneItemType } from './helpers';

type TimezoneDropdownProps = {
  timezones: TimezoneItemType[];
  dateByTimePercentage: dayjs.Dayjs;
  selectedValue: TimezoneItemType | undefined;
  onChange: (id: TimezoneItemType) => void;
};

export const TimezoneDropdown = ({
  timezones,
  dateByTimePercentage,
  selectedValue,
  onChange,
}: TimezoneDropdownProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [showDropdown, setShowDropdown] = useState(false);

  const timezoneList = useMemo(() => {
    const options = Array.from(timezones)
      .sort((a, b) => a.offset - b.offset)
      .map((timezone) => ({
        id: timezone.id,
        value: timezone.id,
        label: `${timezone.text} - ${dateByTimePercentage
          .tz(timezone.timezone)
          .format('MM/DD, hh:mm A')}`,
      }));

    return options;
  }, [dateByTimePercentage, timezones]);

  const selectedItem = timezoneList.find(
    (item) => item.id === selectedValue?.id
  );

  return (
    <StyledContainer onClick={() => setShowDropdown(true)}>
      <div ref={ref}>{selectedItem?.label || 'Not selected'}</div>
      {showDropdown && (
        <Dropdown
          options={timezoneList}
          onClose={() => setShowDropdown(false)}
          onSelect={({ value }) =>
            onChange(timezones.filter((i) => i.id === value)[0])
          }
          targetRef={ref}
        />
      )}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  & > div {
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
`;
