import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Eye, EyeOff } from 'lucide-react';
import { useStore, type Label as LabelType } from './store';
import { ColorPicker } from '@/components/ui/color-picker';

interface LabelsSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LabelsSettings({
  open,
  onOpenChange,
}: LabelsSettingsProps) {
  const { labels, hiddenLabelIds, createLabel, updateLabel, deleteLabel, toggleLabelVisibility } = useStore();

  const handleAddLabel = () => {
    createLabel({
      name: '',
      color: '#808080',
    });
  };

  const handleRemoveLabel = (id: string) => {
    deleteLabel(id);
  };

  const handleLabelChange = (
    id: string,
    field: 'name' | 'color',
    value: string
  ) => {
    updateLabel(id, { [field]: value });
  };

  const isLabelHidden = (id: string) => {
    return hiddenLabelIds.includes(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Labels Settings</DialogTitle>
          <DialogDescription>
            Manage your labels and toggle their visibility in the calendar
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Labels</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLabel}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Label
              </Button>
            </div>
            <div className="space-y-2">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleLabelVisibility(label.id)}
                    title={isLabelHidden(label.id) ? 'Show label' : 'Hide label'}
                  >
                    {isLabelHidden(label.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <ColorPicker
                    value={label.color}
                    onChange={(color) => handleLabelChange(label.id, 'color', color)}
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
                  <Input
                    type="text"
                    placeholder="Label name"
                    value={label.name}
                    onChange={(e) =>
                      handleLabelChange(label.id, 'name', e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLabel(label.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {labels.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No labels yet. Click "Add Label" to create one.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

