import { Outlet, createHashRouter } from 'react-router-dom';
import Layout from './src/components/layout';
import HomePage from './src/pages';

import './src/assets/styles/global.scss';

const router = createHashRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);

export default router;
