import familyRouter from '@/app/family-tree/router';
import HomePage from '@/apps/HomePage';
import timelineTodoRouter from '@/apps/TimelineTodo/router';
import AppLayout from '@/containers/AppLayout';
import { Outlet, createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/cdn',
    element: (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'family-tree',
        children: familyRouter,
      },
      {
        path: 'timeline-todo',
        children: timelineTodoRouter,
      },
    ],
  },
]);

export default router;
