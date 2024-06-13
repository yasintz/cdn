import { cn } from '@/lib/utils';
import { getTagColor } from './helpers';

type TagProps = {
  tag: string;
  onClick?: () => void;
  className?: string;
};

const Tag = ({ tag, className, onClick }: TagProps) => {
  const { backgroundColor, color } = getTagColor(tag);
  return (
    <div
      className={cn(
        'text-xs px-2 py-0.5 rounded-full cursor-pointer',
        className
      )}
      style={{
        backgroundColor,
        color,
      }}
      onClick={onClick}
    >
      {tag}
    </div>
  );
};

export default Tag;
