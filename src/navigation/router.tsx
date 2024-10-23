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
        lazy: () => import('../apps/HomePage'),
      },
      {
        path: 'family-tree/*',
        lazy: () => import('../app/family-tree/router'),
      },
      {
        path: 'timeline-todo/*',
        lazy: () => import('../apps/TimelineTodo/router'),
      },
      {
        path: 'time-tracker',
        lazy: () => import('../apps/TimeTracker'),
      },
      {
        path: 'video-player',
        lazy: () => import('../apps/VideoPlayer'),
      },
      {
        path: 'piano-exercise',
        lazy: () => import('../apps/PianoExercise'),
      },
      {
        path: 'calendar',
        lazy: () => import('../apps/Calendar'),
      },
      {
        path: 'code-snippets',
        lazy: () => import('../apps/CodeSnippets'),
      },
    ],
  },
]);

export default router;
