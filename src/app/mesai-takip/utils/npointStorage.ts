/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function npointStorage(id: string) {
  const apiUrl = `https://api.npoint.io/${id}`;
  const set = async (value: string) => {
    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: value,
    });
  };
  return {
    getItem: () => fetch(apiUrl).then((res) => res.text()),
    // @ts-ignore
    setItem: (name: string, val: string) => set(val),
    // @ts-ignore
    removeItem: async (name: string) => set('{}'),
  };
}
