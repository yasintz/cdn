import { NavLink, useSearchParams } from 'react-router-dom';
import { SessionType } from './store';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SessionButtonProps = {
  session: SessionType;
  isActive: boolean;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  children?: React.ReactNode;
  className?: string;
};

const SessionButton = ({
  session,
  isActive,
  variant,
  children,
  size = 'sm',
}: SessionButtonProps) => {
  const [searchParams] = useSearchParams();
  return (
    <NavLink
      to={`/cdn/timeline-todo/${session.id}?${searchParams.toString()}`}
      key={session.id}
      className="rounded-md"
    >
      <Button
        size={size}
        variant={variant || (isActive ? 'default' : 'outline')}
        className={cn(session.archived && 'opacity-50')}
      >
        {session.name}
        {children}
      </Button>
    </NavLink>
  );
};

export default SessionButton;
