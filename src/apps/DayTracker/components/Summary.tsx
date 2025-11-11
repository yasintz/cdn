import { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useStore, selectSummary } from '@/apps/Calendar/store';

type Period = 'daily' | 'weekly' | 'monthly' | '3months' | '6months' | 'year';

const periodLabels: Record<Period, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  '3months': '3 Months',
  '6months': '6 Months',
  year: 'Year',
};

export function Summary() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('daily');
  const summary = useStore(selectSummary(selectedPeriod));

  const dateRange =
    summary && summary.startDate !== summary.endDate
      ? `${format(new Date(summary.startDate), 'MMM d, yyyy')} - ${format(
          new Date(summary.endDate),
          'MMM d, yyyy'
        )}`
      : summary
        ? format(new Date(summary.endDate), 'MMMM d, yyyy')
        : '';

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Summary</h1>
        <p className="text-muted-foreground mt-2">
          View your time tracking statistics across different periods
        </p>
      </div>

      <Tabs
        value={selectedPeriod}
        onValueChange={(value) => setSelectedPeriod(value as Period)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="3months">3 Months</TabsTrigger>
          <TabsTrigger value="6months">6 Months</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="mt-6">
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>{periodLabels[selectedPeriod]} Summary</CardTitle>
                <CardDescription>{dateRange}</CardDescription>
              </CardHeader>
              <CardContent>
                {summary.totalHours === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No data available for this period.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <span className="text-lg font-semibold">Total Hours</span>
                      <span className="text-2xl font-bold">
                        {summary.totalHours}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Activity Breakdown
                      </h3>
                      {summary.activities.map((item) => (
                        <div key={item.activity} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium">
                                {item.activity}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground">
                                {item.percentage.toFixed(1)}%
                              </span>
                              <span className="font-semibold w-16 text-right">
                                {item.hours} {item.hours === 1 ? 'hour' : 'hours'}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full transition-all"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

