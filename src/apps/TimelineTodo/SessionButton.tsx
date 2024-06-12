import { NavLink, useSearchParams } from 'react-router-dom';
import { SessionType } from './store';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SessionButtonProps = {
  session: SessionType;
  isActive: boolean;
  variant?: ButtonProps['variant'];
};

const SessionButton = ({ session, isActive, variant }: SessionButtonProps) => {
  const [searchParams] = useSearchParams();
  return (
    <NavLink
      to={`/cdn/timeline-todo/${session.id}?${searchParams.toString()}`}
      key={session.id}
      className="rounded-md"
    >
      <Button
        size="sm"
        variant={variant || (isActive ? 'default' : 'outline')}
        className={cn(session.archived && 'opacity-50')}
      >
        {session.name}
      </Button>
    </NavLink>
  );
};

export default SessionButton;
