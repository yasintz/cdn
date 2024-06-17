import { cn } from '@/lib/utils';
import { getTagColor } from './helpers';

type TagProps = {
  tag: string;
  onClick?: () => void;
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
    >
      {tag}
    </div>
  );
};

export default Tag;
