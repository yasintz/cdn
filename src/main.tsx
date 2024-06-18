import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import '../app/globals.css';
import '../app/main.scss';

import router from './navigation/router';

const element = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(element);

root.render(
  <>
    <RouterProvider router={router} />
    <Toaster />
  </>
);
