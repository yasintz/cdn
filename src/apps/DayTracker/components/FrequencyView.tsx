import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useStore, selectDayTrackerEvents, selectDayData } from '@/apps/Calendar/store';
import { generateHourBlocks } from '../lib/hour-utils';
import dayjs from '@/helpers/dayjs';
import Color from 'color';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Period = 'weekly' | 'monthly';

interface WeekData {
  startDate: string;
  endDate: string;
  label: string;
}

interface MonthData {
  startDate: string;
  endDate: string;
  label: string;
}

interface FrequencyData {
  activity: string | null;
  color: string;
  count: number;
}

export function FrequencyView() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('weekly');
  const dayTrackerEvents = useStore(selectDayTrackerEvents);

  // Calculate 8 most recent weeks (Mon-Sun)
  const weeks = useMemo((): WeekData[] => {
    const weeksData: WeekData[] = [];
    const today = dayjs();

    for (let i = 0; i < 8; i++) {
      // Get the Monday of the week that is i weeks before this week
      const weekStart = today.subtract(i, 'week').startOf('week').add(1, 'day'); // dayjs week starts on Sunday, add 1 to get Monday
      const weekEnd = weekStart.add(6, 'day'); // Sunday

      weeksData.push({
        startDate: weekStart.format('YYYY-MM-DD'),
        endDate: weekEnd.format('YYYY-MM-DD'),
        label: `Week ${i + 1}`,
      });
    }

    return weeksData.reverse(); // Most recent week last
  }, []);

  // Calculate 6 most recent months
  const months = useMemo((): MonthData[] => {
    const monthsData: MonthData[] = [];
    const today = dayjs();

    for (let i = 0; i < 6; i++) {
      const monthStart = today.subtract(i, 'month').startOf('month');
      const monthEnd = monthStart.endOf('month');

      monthsData.push({
        startDate: monthStart.format('YYYY-MM-DD'),
        endDate: monthEnd.format('YYYY-MM-DD'),
        label: monthStart.format('MMM YY'),
      });
    }

    return monthsData.reverse(); // Most recent month last
  }, []);

  // Calculate frequency data for a period
  const calculateFrequency = (
    startDate: string,
    endDate: string,
    hour: string
  ): FrequencyData => {
    const activityCounts = new Map<string, { count: number; color: string }>();

    // Iterate through all days in the period
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);

    while (currentDate.isSameOrBefore(end, 'day')) {
      const dateString = currentDate.format('YYYY-MM-DD');
      const dayData = selectDayData(dateString)(useStore.getState());

      // Find the activity for this hour
      const hourData = dayData.hours.find((h) => h.hour === hour);
      const activity = hourData?.activity;

      if (activity) {
        // Find the event to get its color
        const event = dayTrackerEvents.find((e) => e.title === activity);
        const color = event?.color || '#808080';

        const current = activityCounts.get(activity) || { count: 0, color };
        activityCounts.set(activity, {
          count: current.count + 1,
          color,
        });
      }

      currentDate = currentDate.add(1, 'day');
    }

    // Find the most frequent activity
    let mostFrequent: FrequencyData = { activity: null, color: '#e5e7eb', count: 0 };

    activityCounts.forEach((data, activity) => {
      if (data.count > mostFrequent.count) {
        mostFrequent = { activity, color: data.color, count: data.count };
      }
    });

    return mostFrequent;
  };

  const hourBlocks = useMemo(() => generateHourBlocks(), []);
  const periods = selectedPeriod === 'weekly' ? weeks : months;

  const getLightBackgroundColor = (color: string): string => {
    return Color(color).mix(Color('white'), 0.8).hex();
  };

  return (
    <div className="container mx-auto py-8 max-w-full px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/cdn/day-tracker')}
            title="Back to Daily Tracker"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Frequency View</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          View the most frequent activities for each hour across weeks or months
        </p>
      </div>

      <Tabs
        value={selectedPeriod}
        onValueChange={(value) => setSelectedPeriod(value as Period)}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly">Weekly (8 weeks)</TabsTrigger>
          <TabsTrigger value="monthly">Monthly (6 months)</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Frequency Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* Header row with period labels */}
                  <div className="flex gap-2 mb-2">
                    <div className="w-16 shrink-0" /> {/* Empty space for hour labels */}
                    {periods.map((period) => (
                      <div
                        key={period.label}
                        className="w-20 shrink-0 text-center text-sm font-semibold"
                      >
                        {period.label}
                      </div>
                    ))}
                  </div>

                  {/* Hour rows */}
                  {hourBlocks.map((hour) => (
                    <div key={hour} className="flex gap-2 mb-2">
                      {/* Hour label */}
                      <div className="w-16 shrink-0 text-sm font-medium flex items-center justify-end pr-2">
                        {hour}
                      </div>

                      {/* Period cells */}
                      {periods.map((period) => {
                        const frequencyData = calculateFrequency(
                          period.startDate,
                          period.endDate,
                          hour
                        );
                        const backgroundColor = frequencyData.activity
                          ? getLightBackgroundColor(frequencyData.color)
                          : '#ffffff';

                        return (
                          <div
                            key={period.label}
                            className={cn(
                              'w-20 h-16 shrink-0 rounded-lg transition-all overflow-hidden relative',
                              frequencyData.activity
                                ? 'ring-0 ring-offset-0'
                                : 'ring-1 ring-gray-300'
                            )}
                            style={{ backgroundColor }}
                            title={
                              frequencyData.activity
                                ? `${hour} - ${frequencyData.activity} (${frequencyData.count}x)`
                                : `${hour} - No data`
                            }
                          >
                            {frequencyData.activity && (
                              <>
                                <div
                                  style={{
                                    backgroundColor: frequencyData.color,
                                    width: 4,
                                    height: '100%',
                                    position: 'absolute',
                                  }}
                                />
                                <div className="flex h-full flex-col items-center justify-center p-1 pl-2">
                                  <div className="text-[10px] opacity-80 truncate w-full text-center">
                                    {frequencyData.activity}
                                  </div>
                                  <div className="text-[9px] opacity-60 mt-0.5">
                                    {frequencyData.count}x
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
