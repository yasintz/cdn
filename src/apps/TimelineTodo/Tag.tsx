import { getTagColor } from './helpers';

type TagProps = {
  tag: string;
};

const Tag = ({ tag }: TagProps) => {
  const { backgroundColor, color } = getTagColor(tag);
  return (
    <div
      key={tag}
      className="text-xs px-2 py-0.5 rounded-full"
      style={{
        backgroundColor,
        color,
      }}
    >
      {tag}
    </div>
  );
};

export default Tag;
