import _debounce from 'lodash/debounce';

type IStore = {
  setState: (json: any) => void;
  subscribe: (fn: any) => void;
};

export function googleSheetDb(id: string) {
  const apiUrl = `https://google-sheet-database.vercel.app/api/v2/jdb/19Q7TuqVy08vpu2phdPXPyGN0J1L4iwHOK9_jkxzPHwQ/${id}`;
  const set = async (value: string) => {
    await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: value,
    });
  };
  const api = {
    get: () => fetch(apiUrl).then((res) => res.text()),
    set: (val: string) => set(val),
  };
  return {
    ...api,

    handleStorage: (store: IStore) => {
      const throttledReSync = _debounce((store: any) => {
        api.set(JSON.stringify(store));
      }, 500);

      api.get().then((res) => {
        const json = JSON.parse(res);

        store.setState(json);
        store.subscribe(throttledReSync);
      });
    },
  };
}
