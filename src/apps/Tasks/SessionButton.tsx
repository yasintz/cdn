import { NavLink, useSearchParams } from 'react-router-dom';
import { SessionType } from './store';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  const link = (
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

  if (session.tooltipText) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0} open={isActive ? true : undefined}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent className="mb-2">
            <p>{session.tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return link;
};

export default SessionButton;
