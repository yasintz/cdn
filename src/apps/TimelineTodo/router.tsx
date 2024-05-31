import { RouteObject } from 'react-router-dom';
import TimelineTodo from './TimelineTodo';

const timelineTodoRouter: RouteObject[] = [
  {
    path: ':sessionId?',
    element: <TimelineTodo />,
  },
];

export default timelineTodoRouter;
