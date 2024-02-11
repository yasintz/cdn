import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="flex w-full max-w-2xl items-center space-x-2 mx-auto">
      <Input
        placeholder=""
        defaultValue={searchQuery || ''}
        ref={inputRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit();
          }
        }}
      />
      <Button onClick={onSubmit} variant="outline">
        Search
      </Button>
    </div>
  );
};
