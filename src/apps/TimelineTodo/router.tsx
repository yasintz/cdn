import { RouteObject } from 'react-router-dom';
import TimelineTodo from './TimelineTodo';
import AnalyticsPage from './pages/AnalyticsPage';

const timelineTodoRouter: RouteObject[] = [
  {
    path: ':sessionId?',
    element: <TimelineTodo />,
  },
  {
    path: ':sessionId/analytics',
    element: <AnalyticsPage />,
  },
];

export default timelineTodoRouter;
