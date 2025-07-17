import React from 'react';
import { ViewType, ViewData } from '../types';
import { ViewControls } from './ViewControls';

interface HeaderProps {
  viewData: ViewData;
  examCount: number;
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
  subjectCount: number;
  onSubjectCountChange: (count: number) => void;
}

export function Header({
  viewData,
  examCount,
  selectedView,
  onViewChange,
  subjectCount,
  onSubjectCountChange
}: HeaderProps) {
  return (
    <div className="text-center mb-8 p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-2xl">
      <div className="text-5xl mb-4">{viewData.icon}</div>
      <h1 className="text-4xl font-bold mb-2 drop-shadow-sm">
        {viewData.title}
      </h1>
      <p className="text-lg opacity-90 font-light mb-6">
        {examCount} sınav verisi - {viewData.description}
      </p>

      <ViewControls
        selectedView={selectedView}
        onViewChange={onViewChange}
        subjectCount={subjectCount}
        onSubjectCountChange={onSubjectCountChange}
      />
    </div>
  );
} 