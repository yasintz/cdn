import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { SessionType } from '../store';

type SessionSelectProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: SessionType[];
  onSelect: (session: SessionType) => void;
  children?: React.ReactNode;
};

const SessionSelect = ({
  onOpenChange,
  onSelect,
  open,
  sessions,
  children,
}: SessionSelectProps) => {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children || <div />}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {sessions.map((s) => (
          <DropdownMenuItem key={s.id} onClick={() => onSelect(s)}>
            {s.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SessionSelect;
