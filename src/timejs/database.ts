import { UserTimezoneType } from './helpers';

const DB_LOCAL_STORAGE_KEY = 'Timer.js';

class Database {
  update = async (user: string, data: UserTimezoneType) => {
    const localDb = this.getLocal();
    const newDb = {
      ...localDb,
      [user]: data,
    };
    localStorage.setItem(DB_LOCAL_STORAGE_KEY, JSON.stringify(newDb));

    fetch('https://api.npoint.io/90aeccf680bc493a3cbc', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDb),
    });
  };

  getLocal = (user?: string): UserTimezoneType => {
    const persistStr = localStorage.getItem(DB_LOCAL_STORAGE_KEY);
    const data = JSON.parse(persistStr || '{}');
    if (user === 'all' || !user) {
      return data;
    }
    return data[user];
  };

  get = (user: string): Promise<UserTimezoneType> =>
    fetch('https://api.npoint.io/90aeccf680bc493a3cbc/')
      .then((d) => d.json())
      .then((data) => {
        localStorage.setItem(DB_LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data[user] || {};
      });
}

export default Database;
