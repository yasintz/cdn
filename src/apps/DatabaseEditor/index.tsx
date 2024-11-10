import React, { useEffect, useState } from 'react';
import * as timeTrackerModule from '@/apps/TimeTracker/store';
import * as codeSnippetsModule from '@/apps/CodeSnippets/store';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { googleSheetDB } from '@/utils/googleSheetDb';
import JsonForm from './JsonForm';
import './style.scss';
import _ from 'lodash';

type DatabaseItem = {
  id: string;
  name: string;
  sheetId: string;
  tabId?: string;
};
type DatabaseModule = {
  useStore: {
    __dbModule: DatabaseItem;
  };
};

const databases: Array<DatabaseItem> = [
  timeTrackerModule as any,
  codeSnippetsModule as any,
]
  .map((db) => (db as DatabaseModule).useStore.__dbModule || db)
  .map((db) => ({
    ...db,
    id: `${db.sheetId}/${db.tabId || '0'}`,
  }));

const DatabaseEditor = () => {
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>();
  const [value, setValue] = useState<any>(undefined);
  const [path, setPath] = useState<string>();

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
      {value && (
        <div className="json-form mt-2">
          {path && (
            <div className="border rounded-sm p-1 flex mb-2">
              <button onClick={() => setPath(undefined)}>#.</button>
              {path.split('.').map((p, i, arr) => (
                <button
                  key={i}
                  onClick={() => setPath(arr.slice(0, i + 1).join('.'))}
                >
                  {p}
                  {i === arr.length - 1 ? '' : '.'}
                </button>
              ))}
            </div>
          )}
          <JsonForm
            value={path ? _.get(value, path) : value}
            path={path}
            setPath={setPath}
            onChange={(val) => {
              setValue((prev: any) =>
                path ? _.set(_.cloneDeep(prev), path, val) : val
              );
            }}
          />
        </div>
      )}
    </div>
  );
};

export { DatabaseEditor as Component };
