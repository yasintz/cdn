import { Routes, Route } from 'react-router-dom';
import TimelineTodo from './TimelineTodo';
import SimpleTodoTracker from './SimpleTodoTrackerView';

export default function TimelineTodoRouter() {
  return (
    <Routes>
      <Route path="simple-todo-tracker" element={<SimpleTodoTracker />} />
      <Route path=":sessionId?" element={<TimelineTodo />} />
      <Route
        path=":sessionId/analytics"
        lazy={() => import('./pages/AnalyticsPage')}
      />
    </Routes>
  );
}

export { TimelineTodoRouter as Component };
