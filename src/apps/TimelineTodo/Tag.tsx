import { cn } from '@/lib/utils';
import { getTagColor } from './utils/tags';

type TagProps = {
  tag: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  showBorder?: boolean;
  customBorderColor?: string;
};

const Tag = ({
  tag,
  className,
  showBorder,
  customBorderColor,
  onClick,
  onDoubleClick,
}: TagProps) => {
  const { backgroundColor, color } = getTagColor(tag);
  return (
    <div
      className={cn(
        'text-xs px-2 py-0.5 rounded-full cursor-pointer select-none',
        className
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
    </div>
  );
};

export default Tag;
