export function googleSheetDb(id: string) {
  const apiUrl = `https://google-sheet-database.vercel.app/api/v2/jdb/1D9Lukpd64ZoJ7Xzs2E7GmVn11jB8Kwry0aIvTVmjcg8/${id}`;
  const set = async (value: string) => {
    await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: value,
    });
  };
  return {
    get: () => fetch(apiUrl).then((res) => res.text()),
    set: (val: string) => set(val),
  };
}
