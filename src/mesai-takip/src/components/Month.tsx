import { useEffect, useRef } from 'react';

type MonthProps = {
  month: string;
  onClick: () => void;
  isActive: boolean;
};

export const Month = ({ month, onClick, isActive }: MonthProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: 'center' });
    }
  }, [isActive]);

  return (
    <div
      key={month}
      onClick={onClick}
      ref={ref}
      style={{
        borderRadius: 6,
        backgroundColor: 'white',
        marginRight: 8,
        color: '#6b6d78',
        minWidth: 78,
        minHeight: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(isActive && {
          color: 'white',
          backgroundColor: '#ff543d',
        }),
      }}
    >
      {month}
    </div>
  );
};
