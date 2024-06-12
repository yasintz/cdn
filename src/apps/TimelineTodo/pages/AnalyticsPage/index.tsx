import React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import Analytics from './Analytics';

type AnalyticsPageProps = {};

const AnalyticsPage = (props: AnalyticsPageProps) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions } = useStore();
  const foundSessions = sessions.filter((i) => i.id === sessionId);

  return (
    <Analytics sessions={sessionId === 'all' ? sessions : foundSessions} />
  );
};

export default AnalyticsPage;
