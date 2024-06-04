import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type HeaderButtonProps = {
  hidden?: boolean;
  variant?: ButtonProps['variant'];
  onClick?: () => void;
  icon: LucideIcon;
  title: string;
};

const HeaderButton = ({
  title,
  icon: Icon,
  variant = 'secondary',
  onClick,
  hidden,
}: HeaderButtonProps) => {
  return (
    <Button
      className={cn({ hidden })}
      variant={variant}
      size="sm"
      onClick={onClick}
    >
      <Icon size={14} className="mr-2" />
      {title}
    </Button>
  );
};

export default HeaderButton;
