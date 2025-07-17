import React from 'react';
import { SubjectCardProps } from '../types';
import { getBorderColor } from '../utils/subjectDataUtils';

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  index,
  maxValue,
  viewData,
  lesson,
  examCount,
  subjectGroups,
  onSubjectClick
}) => {
  const averageQuestions = subject.total ? subject.total / examCount : 0;

  const handleClick = () => {
    onSubjectClick(subject.subject, subject.className);
  };

  return (
    <div 
      className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={handleClick}
    >
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`${viewData.colorClass} text-white px-2 py-1 rounded-2xl text-xs font-bold min-w-8 text-center`}>
              #{index + 1}
            </span>
            <span className={`${getBorderColor(lesson)}/20 ${getBorderColor(lesson).replace('border-', 'text-')} px-3 py-1 rounded-2xl text-xs font-semibold`}>
              {viewData.formatValue(subject.rate || subject.displayValue)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Group actions removed - managed on separate page */}
          </div>
        </div>
        
        <div className="text-base font-semibold text-gray-800 leading-snug mb-2">
          {subject.subject}
        </div>
        
        <div className="text-xs text-gray-500 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>📚</span>
            <span>{subject.className}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📝</span>
            <span>Ort: {averageQuestions.toFixed(1)} soru</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 