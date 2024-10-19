import { useQuery } from '@tanstack/react-query';
import ms from 'ms';

let cachedResponse = JSON.parse(localStorage.getItem('currency_cache') || '{}');

async function fetchCurrency() {
  if (cachedResponse.time - Date.now() < ms('10 hour') && cachedResponse.data) {
    return Promise.resolve(cachedResponse.data);
  }

  const data = await fetch(
    'https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_pJz9EnUVfuqKY0g3dR69Ke3AZm87Qzyjn6L1sBPD'
  )
    .then((response) => response.json())
    .then((data) => data.data);

  cachedResponse = {
    time: Date.now(),
    data,
  };

  localStorage.setItem('currency_cache', JSON.stringify(cachedResponse));

  return data;
}

export function useCurrencies(): Record<string, number> {
  const { data } = useQuery({ queryKey: ['currency'], queryFn: fetchCurrency });

  return data || {};
}
