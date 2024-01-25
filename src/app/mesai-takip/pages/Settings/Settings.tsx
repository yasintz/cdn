import { Button } from 'src/app/mesai-takip/components/Button';
import { Input } from 'src/app/mesai-takip/components/Input';
import { useStore } from 'src/app/mesai-takip/useStore';

if (
  localStorage.getItem('theme') === 'dark' ||
  !localStorage.getItem('theme')
) {
  document.documentElement.setAttribute('data-mode', 'dark');
  localStorage.setItem('theme', 'dark');
}

export const Settings = () => {
  const { prices, setPrices } = useStore();

  return (
    <>
      <Button
        onClick={() => {
          if (document.documentElement.getAttribute('data-mode')) {
            document.documentElement.removeAttribute('data-mode');
            localStorage.setItem('theme', 'light');
          } else {
            document.documentElement.setAttribute('data-mode', 'dark');
            localStorage.setItem('theme', 'dark');
          }
        }}
      >
        Temayi Degistir
      </Button>

      <Input
        label="Normal Mesai Ucreti"
        type="number"
        placeholder="100 TL"
        value={prices.weekdays?.toString()}
        onChange={(val) => setPrices({ weekdays: parseFloat(val) })}
      />
      <Input
        label="Haftasonu Mesai Ucreti"
        type="number"
        placeholder="100 TL"
        value={prices.weekends?.toString()}
        onChange={(val) => setPrices({ weekends: parseFloat(val) })}
      />
      <Input
        label="Resmi Tatil Mesai Ucreti"
        type="number"
        placeholder="100 TL"
        value={prices.publicHolidays?.toString()}
        onChange={(val) => setPrices({ publicHolidays: parseFloat(val) })}
      />
    </>
  );
};
