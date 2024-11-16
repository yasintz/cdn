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
  // const [value, setValue] = useState<any>(undefined);
  const [valueString, setValueString] = useState<string | undefined>(undefined);
  const selectedDatabase = databases.find((db) => db.id === selectedDatabaseId);

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

            if (!db || !valueString) {
              return;
            }

            try {
              JSON.parse(valueString);
            } catch (error) {
              alert('Invalid JSON');
            }

            const gSheetDb = googleSheetDB(db.sheetId, db.tabId);

            gSheetDb.set(valueString);
          }}
        >
          Save
        </Button>
      </div>
      {selectedDatabase && (
        <div className="json-form mt-2">
          <textarea
            className="w-full h-96"
            value={valueString}
            onChange={(e) => setValueString(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export { DatabaseEditor as Component };
