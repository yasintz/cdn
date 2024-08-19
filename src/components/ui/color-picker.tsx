'use client';

import { forwardRef, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

import type React from 'react';
import { useEffect, useRef } from 'react';

function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
  const innerRef = useRef<T>(null);

  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });

  return innerRef;
}

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  quickColors?: string[];
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, 'value' | 'onChange' | 'onBlur'> & ColorPickerProps
>(
  (
    {
      disabled,
      value,
      onChange,
      onBlur,
      name,
      className,
      quickColors,
      ...props
    },
    forwardedRef
  ) => {
    const ref = useForwardedRef(forwardedRef);
    const [open, setOpen] = useState(false);

    const parsedValue = useMemo(() => {
      return value || '#FFFFFF';
    }, [value]);

    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
          <Button
            {...props}
            className={cn('block', className)}
            name={name}
            onClick={() => {
              setOpen(true);
            }}
            size="icon"
            style={{
              backgroundColor: parsedValue,
            }}
            variant="outline"
          >
            <div />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full">
          <HexColorPicker color={parsedValue} onChange={onChange} />
          <Input
            className="mt-2"
            maxLength={7}
            onChange={(e) => {
              onChange(e?.currentTarget?.value);
            }}
            ref={ref}
            value={parsedValue}
          />
          {quickColors && (
            <div className="grid grid-cols-5 gap-2 mt-2">
              {quickColors.map((color) => (
                <div
                  className="rounded-sm cursor-pointer col-span-1 aspect-square"
                  style={{
                    backgroundColor: color,

                    border: `2px solid ${
                      color === parsedValue ? '#000' : 'transparent'
                    }`,
                  }}
                  onClick={() => onChange(color)}
                />
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }
);
ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };
