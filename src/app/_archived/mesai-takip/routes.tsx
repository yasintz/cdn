import { createHashRouter } from 'react-router-dom';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings/Settings';
import { CreateEdit } from './pages/CreateEdit';
import { Layout } from './pages/layout';

export const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/create',
        element: <CreateEdit />,
      },
      {
        path: '/edit/:editId',
        element: <CreateEdit />,
      },
    ],
  },
]);
