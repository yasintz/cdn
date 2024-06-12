import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import Analytics from './Analytics';

const AnalyticsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions } = useStore();
  const foundSessions = sessions.filter((i) => i.id === sessionId);

  return (
    <Analytics sessions={sessionId === 'all' ? sessions : foundSessions} />
  );
};

export default AnalyticsPage;
