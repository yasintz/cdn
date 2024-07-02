import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type SessionDialogInput = {
  name: string;
  tooltip?: string;
};

type SessionDialogProps<T> = {
  title: string;
  buttonText?: string;
  onSubmit?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  value: T;
  onChange: (input: T) => void;
};

function SessionDialog<T extends SessionDialogInput>({
  onOpenChange,
  open,
  children,
  value,
  onChange,
  buttonText,
  onSubmit,
  title,
}: SessionDialogProps<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-full md:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name *
            </Label>
            <Input
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Tooltip
            </Label>
            <Input
              value={value.tooltip}
              onChange={(e) => onChange({ ...value, tooltip: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        {buttonText && onSubmit && (
          <DialogFooter>
            <Button onClick={onSubmit}>{buttonText}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SessionDialog;
