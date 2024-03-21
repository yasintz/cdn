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
  return {
    get: () => fetch(apiUrl).then((res) => res.text()),
    set: (val: string) => set(val),
  };
}
