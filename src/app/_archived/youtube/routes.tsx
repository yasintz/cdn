import { createHashRouter } from 'react-router-dom';
import { SearchPage } from './pages/Search';
import { WatchPage } from './pages/Watch';

export const router = createHashRouter([
  {
    path: '/',
    element: <SearchPage />,
  },
  {
    path: '/results',
    element: <SearchPage />,
  },
  {
    path: '/watch',
    element: <WatchPage />,
  },
]);
