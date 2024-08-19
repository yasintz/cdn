import { Routes, Route } from 'react-router-dom';
import TimelineTodo from './TimelineTodo';

export default function TimelineTodoRouter() {
  return (
    <Routes>
      <Route path=":sessionId?" element={<TimelineTodo />} />
      <Route
        path=":sessionId/analytics"
        lazy={() => import('./pages/AnalyticsPage')}
      />
    </Routes>
  );
}

export { TimelineTodoRouter as Component };
