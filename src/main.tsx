import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ClickToComponent } from 'click-to-react-component';
import '../app/globals.css';
import '../app/main.scss';
import './lib/scrollsync';

import router from './navigation/router';

const element = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(element);
const queryClient = new QueryClient();

root.render(
  <>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
    <ClickToComponent editor="cursor" />
    <Toaster />
  </>
);
