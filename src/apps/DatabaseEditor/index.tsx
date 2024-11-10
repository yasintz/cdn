import React, { useEffect, useState } from 'react';
import * as timeTrackerModule from '@/apps/TimeTracker/store';
import * as timelineTodoModule from '@/apps/TimelineTodo/store';
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

const modules = [timeTrackerModule, timelineTodoModule];

const databases: Array<DatabaseItem> = modules
  .map((db) => (db as any).useStore.__dbModule || db)
  .map((db) => ({
    ...db,
    id: `${db.sheetId}/${db.tabId || '0'}`,
  }));

const DatabaseEditor = () => {
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>();
  const [value, setValue] = useState<any>(undefined);
  const selectedDatabase = databases.find((db) => db.id === selectedDatabaseId);

  useEffect(() => {
    const db = databases.find((db) => db.id === selectedDatabaseId);

    if (!db) {
      setValue(undefined);
      return;
    }

    const gSheetDb = googleSheetDB(db.sheetId, db.tabId);

    gSheetDb.get().then(setValue);
  }, [selectedDatabaseId]);

  return (
    <div className="container">
      <div className="flex justify-between items-center gap-2">
        <Combobox
          options={databases.map((p) => ({
            label: p.name,
            value: p.id,
          }))}
          value={selectedDatabaseId || ''}
          setValue={setSelectedDatabaseId}
          className="min-w-56"
        />
        <Button
          size="sm"
          onClick={() => {
            const db = databases.find((db) => db.id === selectedDatabaseId);

            if (!db) {
              return;
            }

            const gSheetDb = googleSheetDB(db.sheetId, db.tabId);

            gSheetDb.set(JSON.stringify(value));
          }}
        >
          Save
        </Button>
      </div>
      {value && selectedDatabase && (
        <div className="json-form mt-2">
          <textarea
            className="w-full h-96"
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => setValue(JSON.parse(e.target.value))}
          />
        </div>
      )}
    </div>
  );
};

export { DatabaseEditor as Component };
