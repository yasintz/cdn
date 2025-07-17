import React from 'react';
import { StatisticsCardsProps } from '../types';

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ 
  examCount, 
  viewData, 
  subjectGroups 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl text-center shadow-lg">
        <div className="text-3xl mb-2">📊</div>
        <div className="text-3xl font-bold mb-1">
          {examCount}
        </div>
        <div className="text-sm opacity-90">
          Toplam Sınav
        </div>
      </div>

      <div className={`bg-gradient-to-br from-current to-current/80 text-white p-6 rounded-xl text-center shadow-lg ${viewData.colorClass}`}>
        <div className="text-3xl mb-2">{viewData.icon}</div>
        <div className="text-3xl font-bold mb-1">
          {viewData.data.length}
        </div>
        <div className="text-sm opacity-90">
          Analiz Edilen Konu
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl text-center shadow-lg">
        <div className="text-3xl mb-2">🔗</div>
        <div className="text-3xl font-bold mb-1">
          {subjectGroups.length}
        </div>
        <div className="text-sm opacity-90">
          Konu Grubu
        </div>
      </div>
    </div>
  );
}; 