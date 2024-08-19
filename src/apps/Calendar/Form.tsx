import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EventType } from './store';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/ui/color-picker';
import { DateTimePicker } from '@/components/ui/datetime-picker';

export type FormInputs = Omit<EventType, 'id'>;
type FormProps = {
  defaultValues?: FormInputs;
  onSubmit: (data: FormInputs) => void;
  onDelete?: () => void;
};

const Form = ({
  defaultValues: defaultValuesProp,
  onSubmit,
  onDelete,
}: FormProps) => {
  const defaultValues: FormInputs = {
    title: '',
    allDay: false,
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    isGroup: false,
    color: '#8f8f8f',
    ...defaultValuesProp,
  };

  const { register, handleSubmit, control } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Create / Update</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Title
          </Label>
          <Input className="col-span-3" {...register('title')} />
        </div>
      </div>
      <div className="grid gap-4 py-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="name" className="text-right">
            As Group
          </Label>
          <Controller
            control={control}
            name="isGroup"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Color
            </Label>
            <ColorPicker
              value={field.value || ''}
              onChange={field.onChange}
              quickColors={[
                '#8f8f8f',
                '#f44336',
                '#e91e63',
                '#9c27b0',
                '#673ab7',
                '#3f51b5',
                '#2196f3',
                '#03a9f4',
                '#00bcd4',
                '#009688',
                '#4caf50',
                '#8bc34a',
                '#cddc39',
                '#ffeb3b',
                '#ffc107',
              ]}
            />
          </div>
        )}
      />

      <div className="flex gap-2">
        <div className="flex flex-col flex-1 gap-2">
          <Label>Start At</Label>
          <Controller
            control={control}
            name="start"
            render={({ field }) => (
              <DateTimePicker
                value={new Date(field.value)}
                onChange={(d) => field.onChange(d.toISOString())}
              />
            )}
          />
        </div>
        <div className="flex flex-col flex-1 gap-2">
          <Label>End At</Label>
          <Controller
            control={control}
            name="end"
            render={({ field }) => (
              <DateTimePicker
                value={new Date(field.value)}
                onChange={(d) => field.onChange(d.toISOString())}
              />
            )}
          />
        </div>
      </div>
      <DialogFooter className="mt-4">
        {onDelete && (
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        )}
        <DialogClose>
          <Button type="submit">Done</Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
};

export default Form;
