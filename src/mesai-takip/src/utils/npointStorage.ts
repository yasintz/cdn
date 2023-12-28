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
    setItem: (name: string, val: string) => set(val),
    removeItem: async (name: string) => set('{}'),
  };
}
