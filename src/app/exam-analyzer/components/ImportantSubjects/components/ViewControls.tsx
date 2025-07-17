import React from 'react';
import { ViewType } from '../types';

interface ViewControlsProps {
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
  subjectCount: number;
  onSubjectCountChange: (count: number) => void;
  onCreateGroup: () => void;
}

export function ViewControls({
  selectedView,
  onViewChange,
  subjectCount,
  onSubjectCountChange,
  onCreateGroup
}: ViewControlsProps) {
  const handleSubjectCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
    onSubjectCountChange(value);
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-4 flex-wrap">
      <select
        value={selectedView}
        onChange={(e) => onViewChange(e.target.value as ViewType)}
        className="px-4 py-3 rounded-lg border-none bg-white/90 text-gray-800 text-base font-semibold cursor-pointer min-w-[250px] shadow-lg"
      >
        <option value="frequency">📊 En Sık Karşılaşılan Konular</option>
        <option value="mistakes">❌ En Çok Hata Yapılan Konular</option>
        <option value="empty">⭕ En Çok Boş Bırakılan Konular</option>
      </select>
      
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

      <button
        onClick={onCreateGroup}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg transition-colors flex items-center gap-2"
      >
        <span>🔗</span>
        <span>Grup Oluştur</span>
      </button>
    </div>
  );
} 