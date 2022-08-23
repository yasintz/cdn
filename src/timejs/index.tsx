import './index.sass';
import { useEffect, useState } from 'react';
import { UserTimezoneType } from './helpers';
import Database from './database';
import timezone from './timezone';
import { TimeJs } from './timejs';

type TimeJsProps = {};

const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get('user');
const database = new Database();

export const Timejs = (props: TimeJsProps) => {
  const [data, setData] = useState<UserTimezoneType | undefined>();

  useEffect(() => {
    async function main() {
      if (!user) {
        return;
      }

      const localData = database.getLocal(user);

      if (localData) {
        setData(localData);
      }

      setData(await database.get(user));
    }

    main();
  }, []);

  if (!user) {
    return <div>?user={'{userName}'}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <TimeJs
      data={data}
      timezone={timezone}
      onUpdate={(newData) => {
        setData(newData);
        database.update(user, newData);
      }}
    />
  );
};
