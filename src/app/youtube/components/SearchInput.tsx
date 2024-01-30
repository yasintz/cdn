import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const SearchInput = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search_query');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const onSubmit = () => {
    navigate(`/results?search_query=${inputRef.current?.value}`);
  };
  return (
    <div>
      <input
        defaultValue={searchQuery || ''}
        ref={inputRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit();
          }
        }}
      />
      <button onClick={onSubmit}>Search</button>
    </div>
  );
};
