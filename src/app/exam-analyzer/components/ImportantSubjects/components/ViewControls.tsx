import React from 'react';
import { ViewType } from '../types';
import { cn } from '@/lib/utils';

interface ViewControlsProps {
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
  subjectCount: number;
  onSubjectCountChange: (count: number) => void;
}

export function ViewControls({
  selectedView,
  onViewChange,
  subjectCount,
  onSubjectCountChange,
}: ViewControlsProps) {
  const handleSubjectCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
    onSubjectCountChange(value);
  };

  const tabs = [
    { value: 'frequency', label: '📊 En Sık Karşılaşılan Konular' },
    { value: 'mistakes', label: '❌ En Çok Hata Yapılan Konular' },
    { value: 'empty', label: '⭕ En Çok Boş Bırakılan Konular' },
  ];

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-xl p-1 shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onViewChange(tab.value as ViewType)}
            className={cn(
              'px-6 py-3 rounded-lg font-semibold text-sm relative border-b-2 border-transparent',
              selectedView === tab.value
                ? 'bg-white text-gray-800 shadow-md border-blue-500 z-10'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white/90 px-3 py-3 rounded-lg shadow-lg">
          <span className="text-base font-semibold text-gray-800 whitespace-nowrap">
            📊 Konu Sayısı:
          </span>
          <input
            type="number"
            min="1"
            max="20"
            value={subjectCount}
            onChange={handleSubjectCountChange}
            className="px-2 py-1 rounded border border-gray-300 w-15 text-center text-base font-semibold text-gray-800 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
