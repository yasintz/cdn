import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { LucideIcon } from 'lucide-react';

type HeaderButtonProps = {
  onClick?: () => void;
  icon: LucideIcon;
  title: string;
  hidden?: boolean;
  className?: string;
};

const HeaderButton = ({
  title,
  icon: Icon,
  onClick,
  hidden,
  className,
}: HeaderButtonProps) => {
  if (hidden) {
    return null;
  }

  return (
    <DropdownMenuItem onClick={onClick} className={className}>
      <Icon size={14} className="mr-2" />
      {title}
    </DropdownMenuItem>
  );
};

export default HeaderButton;
