import { createHashRouter } from 'react-router-dom';
import HomePage from './pages/Home';

export const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);
