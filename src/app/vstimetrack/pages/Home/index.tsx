import { Combobox } from '@/components/ui/combobox';
import { googleSheetDb } from '@/utils/googleSheetDb';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useSearchParams } from 'react-router-dom';

dayjs.extend(duration);

type LogType = {
  time: number;
  path: string;
};

function getTotal(logs: LogType[]) {
  const TIMEOUT = 1000 * 60 * 5; // 5 minutes
  const sections: Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> = [];

  logs.forEach((log, index) => {
    const previous = logs[index - 1];
    if (!previous) {
      sections.push({
        start: dayjs(log.time),
        end: dayjs(log.time).add(1, 'minute'),
      });
      return;
    }

    const diff =
      new Date(log.time).getTime() - new Date(previous.time).getTime();

    if (diff > TIMEOUT) {
      sections[sections.length - 1].end = dayjs(previous.time).add(1, 'minute');

      sections.push({
        start: dayjs(log.time),
        end: dayjs(log.time).add(1, 'minute'),
      });
    }
  });

  const total = sections.reduce((acc, cur) => acc + cur.end.diff(cur.start), 0);

  return { total, sections };
}

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const project = searchParams.get('project') || '';

  const { data } = useQuery({
    queryKey: ['vscode-time-tracker'],
    queryFn: () =>
      googleSheetDb('135325869')
        .get()
        .then((res) => JSON.parse(res)),
  });

  const logs: LogType[] = data?.logs || [];

  const groups = _.groupBy(logs, 'path');

  const projectLogs = groups[project];

  const days = useMemo(() => {
    const dayGroups = _.groupBy(projectLogs || [], (l) =>
      dayjs(l.time).format('MM/DD/YYYY')
    );

    return Object.keys(dayGroups).map((day) => {
      const { sections, total } = getTotal(dayGroups[day]);

      return {
        sections,
        total,
        totalDuration: dayjs.duration(total).format('HH:mm'),
        day,
      };
    });
  }, [projectLogs]);

  return (
    <div className="p-8">
      <Combobox
        value={project}
        setValue={(value) =>
          setSearchParams((prev) => {
            prev.set('project', value);
            return prev;
          })
        }
        placeholder="Select Project"
        options={Object.keys(groups).map((path) => ({
          label: path,
          value: path,
        }))}
      />
      <div className="flex flex-col mt-4 p-3 gap-4">
        {days.map(({ day, totalDuration, sections }) => (
          <Collapsible key={day} className="border rounded-lg p-3 select-none">
            <CollapsibleTrigger asChild>
              <div className="cursor-pointer">
                <span className="font-bold">{day}</span>: {totalDuration}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-3 mt-3">
              {sections.map((section, index) => (
                <div key={index}>
                  <span className="font-bold">
                    {section.start.format('HH:mm')} -{' '}
                    {section.end.format('HH:mm')}
                  </span>
                  :{' '}
                  {dayjs
                    .duration(section.end.diff(section.start))
                    .format('HH:mm')}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
