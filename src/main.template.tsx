import ReactDOM from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import '../app/globals.css';

// {import}

const element = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(element);

// @ts-ignore
const Root = App;

root.render(
  <>
    <Root />
    <Toaster />
  </>
);
