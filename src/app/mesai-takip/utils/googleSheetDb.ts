/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function googleSheetDb(id: string) {
  const apiUrl = `https://google-sheet-database.vercel.app/json/17ElyhzAk2u-lytqilw3koitxV-8J6egFGVh7NabwlAg/${id}`;
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
