import { Routes, Route } from 'react-router-dom';
import SimpleTodoTracker from './SimpleTodoTrackerView';

export default function TimelineTodoRouter() {
  return (
    <Routes>
      <Route path="simple-todo-tracker" element={<SimpleTodoTracker />} />
      <Route path=":sessionId?" lazy={() => import('./TimelineTodo')} />
      <Route
        path=":sessionId/analytics"
        lazy={() => import('./pages/AnalyticsPage')}
      />
    </Routes>
  );
}

export { TimelineTodoRouter as Component };
