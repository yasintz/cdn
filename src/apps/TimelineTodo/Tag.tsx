import { getTagColor } from './helpers';

type TagProps = {
  tag: string;
  onClick?: () => void;
};

const Tag = ({ tag, onClick }: TagProps) => {
  const { backgroundColor, color } = getTagColor(tag);
  return (
    <div
      className="text-xs px-2 py-0.5 rounded-full cursor-pointer"
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
