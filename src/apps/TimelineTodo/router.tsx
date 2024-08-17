import { Routes, Route } from 'react-router-dom';
import TimelineTodo from './TimelineTodo';
import AnalyticsPage from './pages/AnalyticsPage';

export default function TimelineTodoRouter() {
  return (
    <Routes>
      <Route path=":sessionId?" element={<TimelineTodo />} />
      <Route
        path=":sessionId/analytics"
        element={<AnalyticsPage />}
      />
    </Routes>
  );
}

export { TimelineTodoRouter as Component };
