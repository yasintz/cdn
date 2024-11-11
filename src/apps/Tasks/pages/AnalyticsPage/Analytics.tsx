import React from 'react';
import { SessionType } from '../../store/session/session-slice';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useStore } from '../../store';
import _ from 'lodash';
import { getTagColor, getTagsData } from '../../utils/tags';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

type AnalyticsProps = {
  sessions: SessionType[];
};

const Analytics = ({ sessions }: AnalyticsProps) => {
  const { entries, allTags } = useStore();
  const sessionsData = sessions.map((session) => {
    const sessionEntries = entries.filter((i) => i.sessionId === session.id);
    return {
      session,
      entries: sessionEntries,
      tags: getTagsData(sessionEntries, allTags),
    };
  });

  const tags = _.uniq(
    sessionsData.reduce(
      (acc, cur) => [...acc, ...cur.tags.groupedTags.map((i) => i.tag)],
      [] as string[]
    )
  ).map((tag) => ({
    tag,
    colors: getTagColor(tag),
    spentTime: sessionsData.reduce(
      (acc, cur) =>
        acc + (cur.tags.groupedTags.find((i) => i.tag === tag)?.spentTime || 0),
      0
    ),
  }));

  return (
    <div className="p-4">
      <Bar
        data={{
          labels: tags.map((t) => t.tag),
          datasets: [
            {
              label: 'My First Dataset',
              data: tags.map((i) => i.spentTime),
              borderWidth: 1,
              borderRadius: 4,
              borderColor: tags.map((t) => t.colors.color),
              backgroundColor: tags.map((t) => t.colors.backgroundColor),
            },
          ],
        }}
      />
    </div>
  );
};

export default Analytics;
