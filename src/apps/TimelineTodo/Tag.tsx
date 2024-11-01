import { cn } from '@/lib/utils';
import { getTagColor } from './utils/tags';

type TagProps = {
  tag: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  showBorder?: boolean;
  customBorderColor?: string;
  actions?: React.ReactNode;
};

const Tag = ({
  tag,
  className,
  showBorder,
  customBorderColor,
  onClick,
  onDoubleClick,
  actions,
}: TagProps) => {
  const { backgroundColor, color } = getTagColor(tag);
  return (
    <div
      className={cn(
        'text-xs px-2 py-0.5 rounded-full select-none',
        className,
        (onClick || onDoubleClick) && 'hover:bg-opacity-70 cursor-pointer'
      )}
      style={{
        backgroundColor,
        color,
        border: showBorder
          ? `1px solid ${customBorderColor || color}`
          : undefined,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {tag}
      {actions}
    </div>
  );
};

export default Tag;
