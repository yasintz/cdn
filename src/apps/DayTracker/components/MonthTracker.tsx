import { useMemo, useState, useRef, useEffect } from 'react';
import { DailyTracker, type DailyTrackerHandle } from './DailyTracker';
import { Settings } from './Settings';
import { ActivitySelector } from './ActivitySelector';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, BarChart3, Grid3x3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from '@/helpers/dayjs';

export function MonthTracker() {
  const navigate = useNavigate();
  const today = dayjs().startOf('day').toDate();
  const [showSettings, setShowSettings] = useState(false);
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [activeDays, setActiveDays] = useState<Map<string, Set<string>>>(new Map());
  const trackerRefs = useRef<Map<string, DailyTrackerHandle>>(new Map());
  const todayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate 30 days: 14 previous, today, 14 next
  const days = useMemo(() => {
    const daysList: Date[] = [];
    // 14 days before today
    for (let i = 14; i > 0; i--) {
      daysList.push(dayjs(today).subtract(i, 'day').toDate());
    }
    // Today
    daysList.push(today);
    // 14 days after today
    for (let i = 1; i <= 14; i++) {
      daysList.push(dayjs(today).add(i, 'day').toDate());
    }
    return daysList;
  }, [today]);

  // Calculate total 30-minute blocks and day count for multi-day selection
  const selectionSummary = useMemo(() => {
    const totalBlocks = Array.from(activeDays.values()).reduce((sum, hours) => sum + hours.size, 0);
    const totalHours = totalBlocks / 2; // Convert 30-minute blocks to hours
    const dayCount = activeDays.size;
    return { totalBlocks, totalHours, dayCount };
  }, [activeDays]);

  // Auto-scroll to today on mount
  useEffect(() => {
    const scrollToToday = () => {
      if (todayRef.current && scrollContainerRef.current) {
        const todayElement = todayRef.current;
        const container = scrollContainerRef.current;
        
        // Calculate scroll position to center today
        const containerRect = container.getBoundingClientRect();
        const todayRect = todayElement.getBoundingClientRect();
        const scrollLeft = todayRect.left - containerRect.left + container.scrollLeft - (containerRect.width / 2) + (todayRect.width / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
        return true;
      }
      return false;
    };

    // Try immediately, then retry after a short delay if elements aren't ready
    if (!scrollToToday()) {
      const timeoutId = setTimeout(() => {
        scrollToToday();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 p-4">
        <h1 className="text-3xl font-bold">Daily Tracker</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('summary')}
            title="View Summary"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('frequency')}
            title="View Frequency Patterns"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pr-4" ref={scrollContainerRef}>
        <div className="inline-block min-w-full">
          {days.map((date) => {
            const dateString = dayjs(date).format('YYYY-MM-DD');
            const isToday = dayjs(date).isSame(dayjs(today), 'day');
            
            return (
              <div 
                key={dateString} 
                className="flex items-center gap-2 py-2 pl-2"
                ref={isToday ? todayRef : null}
              >
                <div className="sticky left-2 bg-background z-10 min-w-[70px] text-sm font-medium pr-2 h-[64px] flex items-center justify-center border border-gray-200 rounded-lg text-center">
                  <span className={isToday ? 'text-blue-600 font-semibold' : ''}>
                    {dayjs(date).format('MMM D')}
                    {isToday && ' (Today)'}
                  </span>
                </div>
                <DailyTracker 
                  ref={(ref) => {
                    if (ref) {
                      trackerRefs.current.set(dateString, ref);
                    } else {
                      trackerRefs.current.delete(dateString);
                    }
                  }}
                  date={date} 
                  onSelectionChange={(dateString, selectedHours) => {
                    setActiveDays((prev) => {
                      const next = new Map(prev);
                      if (selectedHours.size > 0) {
                        next.set(dateString, selectedHours);
                      } else {
                        next.delete(dateString);
                      }
                      return next;
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {selectionSummary.totalBlocks > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
          <Button
            size="lg"
            onClick={() => setShowActivitySelector(true)}
            className="shadow-lg"
          >
            Assign Activity ({selectionSummary.totalHours} {selectionSummary.totalHours === 1 ? 'hour' : 'hours'} across {selectionSummary.dayCount} {selectionSummary.dayCount === 1 ? 'day' : 'days'})
          </Button>
        </div>
      )}

      {showActivitySelector && (
        <ActivitySelector
          open={showActivitySelector}
          onOpenChange={setShowActivitySelector}
          onSelect={(activityName) => {
            // Assign activity to all selected days
            activeDays.forEach((selectedHours, dateString) => {
              const trackerRef = trackerRefs.current.get(dateString);
              if (trackerRef && selectedHours.size > 0) {
                trackerRef.assignActivity(activityName);
              }
            });
            setShowActivitySelector(false);
            setActiveDays(new Map());
          }}
        />
      )}

      {showSettings && (
        <Settings
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      )}
    </div>
  );
}

