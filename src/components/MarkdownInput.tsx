import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { cn } from '@/lib/utils';
import { EyeIcon, PencilIcon, TrashIcon, XIcon } from 'lucide-react';

type MarkdownInputProps = {
  editable?: boolean;
  onChange: (value: string) => void;
  value: string;
  onInputClose: () => void;
  className?: string;
  onEditableChange?: (editable: boolean) => void;
};

const MarkdownInput = ({
  editable,
  onEditableChange,
  onChange,
  value,
  onInputClose,
  className,
}: MarkdownInputProps) => {
  const contentElement = editable ? (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm outline-none"
      placeholder="Add note..."
    />
  ) : (
    <MarkdownRenderer content={value} />
  );

  return (
    <div className={cn(className)}>
      <div className="header border-b flex justify-between px-3 py-2 text-gray-600">
        <div className="flex gap-2">
          {editable ? (
            <EyeIcon
              className="size-4 cursor-pointer items-center"
              onClick={() => onEditableChange?.(false)}
            />
          ) : (
            <PencilIcon
              className="size-4 cursor-pointer"
              onClick={() => onEditableChange?.(true)}
            />
          )}
        </div>
        <div className="flex gap-2 items-center">
          <TrashIcon
            className="size-3 cursor-pointer"
            onClick={() => {
              onChange('');
              onInputClose();
            }}
          />
          <XIcon className="size-4 cursor-pointer" onClick={onInputClose} />
        </div>
      </div>
      <div className="w-full p-2 mt-2 text-sm">{contentElement}</div>
    </div>
  );
};

export default MarkdownInput;
