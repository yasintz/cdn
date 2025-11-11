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
import { EventType, useStore } from './store';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/ui/color-picker';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import dayjs from '@/helpers/dayjs';
import { showDiff } from '../TimelineTodo/Entry/utils';

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
  const { labels } = useStore();
  const defaultValues: FormInputs = {
    title: '',
    allDay: false,
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    isGroup: false,
    color: '#8f8f8f',
    labels: [],
    ...defaultValuesProp,
  };

  const { register, handleSubmit, control, setValue, getValues } = useForm({
    defaultValues,
  });

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

      <Controller
        control={control}
        name="labels"
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => {
                const isSelected = field.value?.includes(label.id) || false;
                return (
                  <div
                    key={label.id}
                    className="flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? label.color : 'transparent',
                      borderColor: label.color,
                      color: isSelected ? '#fff' : 'inherit',
                    }}
                    onClick={() => {
                      const currentLabels = field.value || [];
                      if (isSelected) {
                        field.onChange(currentLabels.filter((id: string) => id !== label.id));
                      } else {
                        field.onChange([...currentLabels, label.id]);
                      }
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const currentLabels = field.value || [];
                        if (checked) {
                          field.onChange([...currentLabels, label.id]);
                        } else {
                          field.onChange(currentLabels.filter((id: string) => id !== label.id));
                        }
                      }}
                    />
                    <span className="text-sm">{label.name}</span>
                  </div>
                );
              })}
              {labels.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No labels available. Create labels in Settings.
                </div>
              )}
            </div>
          </div>
        )}
      />

      <div className="flex gap-2 mt-2">
        <Controller
          control={control}
          name="start"
          render={({ field }) => (
            <div className="flex flex-col flex-1 gap-2">
              <Label>Start At ({dayjs(field.value).format('HH:mm')})</Label>
              <DateTimePicker
                value={new Date(field.value)}
                onChange={(d) => {
                  const diff = new Date(field.value).getTime() - d.getTime();
                  setValue(
                    'end',
                    new Date(
                      new Date(getValues().end).getTime() - diff
                    ).toISOString()
                  );
                  field.onChange(d.toISOString());
                }}
              />
            </div>
          )}
        />
        <Controller
          control={control}
          name="end"
          render={({ field }) => (
            <div className="flex flex-col flex-1 gap-2">
              <Label>
                End At ({dayjs(field.value).format('HH:mm')}) -{' '}
                {showDiff(dayjs(field.value).diff(dayjs(getValues().start)))}
              </Label>
              <DateTimePicker
                value={new Date(field.value)}
                onChange={(d) => field.onChange(d.toISOString())}
              />
            </div>
          )}
        />
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
