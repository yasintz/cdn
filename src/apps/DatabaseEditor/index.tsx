import React, { useEffect, useState } from 'react';
import { JsonEditor } from 'json-edit-react';
import * as timeTrackerModule from '@/apps/TimeTracker/store';
import * as timelineTodoModule from '@/apps/TimelineTodo/store';
import * as codeSnippetsModule from '@/apps/CodeSnippets/store';
import * as calendarModule from '@/apps/Calendar/store';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { googleSheetDB } from '@/utils/googleSheetDb';
import './style.scss';

type DatabaseItem = {
  id: string;
  name: string;
  sheetId: string;
  tabId?: string;
};

const modules = [
  timeTrackerModule,
  timelineTodoModule,
  codeSnippetsModule,
  calendarModule,
];

const databases: Array<DatabaseItem> = modules
  .map((db) => (db as any).useStore.__dbModule || db)
  .map((db) => ({
    ...db,
    id: `${db.sheetId}/${db.tabId || '0'}`,
  }));

const DatabaseEditor = () => {
  const [mode, setMode] = useState<'json' | 'textarea'>('json');
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [valueString, setValueString] = useState<string | undefined>(undefined);
  const selectedDatabase = databases.find((db) => db.id === selectedDatabaseId);

  const handleUpdate = async () => {
    const db = databases.find((db) => db.id === selectedDatabaseId);

    if (!db || !valueString) {
      return;
    }

    try {
      JSON.parse(valueString);
    } catch (error) {
      alert('Invalid JSON');
      return;
    }

    const gSheetDb = googleSheetDB(db.sheetId, db.tabId);

    setLoading(true);
    await gSheetDb.set(valueString);
    setLoading(false);
  };

  useEffect(() => {
    const db = databases.find((db) => db.id === selectedDatabaseId);

    if (!db) {
      setValueString(undefined);
      return;
    }

    const gSheetDb = googleSheetDB(db.sheetId, db.tabId);

    gSheetDb.get().then((v) => setValueString(JSON.stringify(v, null, 2)));
  }, [selectedDatabaseId]);

  return (
    <div className="container h-full flex flex-col">
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2">
          <Combobox
            options={databases.map((p) => ({
              label: p.name,
              value: p.id,
            }))}
            value={selectedDatabaseId || ''}
            setValue={setSelectedDatabaseId}
            className="min-w-56"
          />

          <Combobox
            options={['json', 'textarea'].map((p) => ({
              label: p,
              value: p,
            }))}
            value={mode}
            setValue={setMode as any}
            className="min-w-56"
          />
        </div>
        <Button size="sm" disabled={loading} onClick={handleUpdate}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
      {selectedDatabase && (
        <div className="json-form mt-2 flex-1 overflow-auto">
          {mode === 'textarea' ? (
            <textarea
              className="flex-1 w-full"
              value={valueString}
              onChange={(e) => setValueString(e.target.value)}
            />
          ) : (
            <JsonEditor
              className="flex-1 w-full"
              data={JSON.parse(valueString || '{}')}
              setData={(v) => setValueString(JSON.stringify(v, null, 2))}
            />
          )}
        </div>
      )}
    </div>
  );
};

export { DatabaseEditor as Component };
