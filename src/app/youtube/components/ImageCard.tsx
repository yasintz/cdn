import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Loading from '@/components/ui/loading';

const Button = ({
  children,
  className,
  onClick,
  onMouseOver,
}: {
  children: any;
  className: string;
  onClick?: () => void;
  onMouseOver?: () => void;
}) => {
  return (
    <button
      className={cn(
        'w-full bg-gradient-to-r hover:bg-gradient-to-br font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 flex gap-4 items-center justify-center',
        className
      )}
      onClick={onClick}
      onMouseOver={onMouseOver}
    >
      {children}
    </button>
  );
};

const buttons = {
  yellow: 'text-white from-yellow-300 via-yellow-400 to-yellow-500',
  blue: 'text-white from-blue-500 via-blue-600 to-blue-700',
  green: 'text-white from-green-500 via-green-600 to-green-700',
};

type ImageCardProps = {
  image: string;
  title: string;
  description: React.ReactNode;
  to?: string;
  comingSoon?: boolean;
  color?: keyof typeof buttons;
  text?: string;
  imageHeight?: number | string;
  className?: string;
  onClick?: () => void;
  fullscreen?: boolean;
  loading?: boolean;
  onHover?: () => void;
};

const ImageCard = (item: ImageCardProps) => {
  const button = (
    <Button
      className={buttons[item.color || 'blue']}
      onClick={item.onClick}
      onMouseOver={item.onHover}
    >
      {item.loading ? (
        <Loading className="size-4" />
      ) : (
        <span>{item.text || 'Open'}</span>
      )}
    </Button>
  );

  return (
    <div
      key={item.image}
      className={cn(
        'w-full flex flex-col bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 overflow-hidden',
        item.comingSoon && 'pointer-events-none opacity-50',
        item.className
      )}
      style={{ maxWidth: 336 }}
    >
      <img
        src={item.image}
        className={cn(
          'w-full object-cover',
          item.fullscreen && 'cursor-pointer'
        )}
        style={{
          height: item.imageHeight || '15rem',
        }}
      />
      <div className="flex flex-col gap-4 p-6 flex-1">
        <div className="text-lg font-bold">
          {item.title}
          {item.comingSoon ? ' (Coming Soon)' : ''}
        </div>
        <div className="flex-1">{item.description}</div>
        {item.to ? (
          <Link to={item.to} className="w-full">
            {button}
          </Link>
        ) : (
          button
        )}
      </div>
    </div>
  );
};

export default ImageCard;
