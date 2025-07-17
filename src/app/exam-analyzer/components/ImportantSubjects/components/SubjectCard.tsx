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
  onSubjectClick,
  onEditGroup,
  onDeleteGroup
}) => {
  const averageQuestions = subject.total ? subject.total / examCount : 0;

  const handleClick = () => {
    onSubjectClick(subject.subject, subject.className);
  };

  const handleEditGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    const group = subjectGroups.find(g => g.id === subject.groupId);
    if (group) onEditGroup(group);
  };

  const handleDeleteGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subject.groupId) onDeleteGroup(subject.groupId);
  };

  return (
    <div 
      className={`bg-gray-50 rounded-xl p-4 border border-gray-200 relative overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors ${
        subject.isGroup ? 'border-green-300 bg-green-50 hover:bg-green-100' : ''
      }`}
      onClick={handleClick}
    >
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`${
              subject.isGroup ? 'bg-green-500' : viewData.colorClass
            } text-white px-2 py-1 rounded-2xl text-xs font-bold min-w-8 text-center`}>
              #{index + 1}
            </span>
            {subject.isGroup && (
              <span className="text-green-600 text-xs font-semibold">🔗 GRUP</span>
            )}
            <span className={`${getBorderColor(lesson)}/20 ${getBorderColor(lesson).replace('border-', 'text-')} px-3 py-1 rounded-2xl text-xs font-semibold`}>
              {viewData.formatValue(subject.rate || subject.displayValue)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {subject.isGroup && subject.groupId && (
              <div className="flex gap-1">
                <button
                  onClick={handleEditGroup}
                  className="text-blue-500 hover:text-blue-700 text-xs p-1"
                  title="Grubu Düzenle"
                >
                  ✏️
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="text-red-500 hover:text-red-700 text-xs p-1"
                  title="Grubu Sil"
                >
                  🗑️
                </button>
              </div>
            )}
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
            {subject.isGroup ? (
              <>
                <span>🔗</span>
                <span>{subject.groupSubjects?.length || 0} konu</span>
              </>
            ) : (
              <>
                <span>📝</span>
                <span>Ort: {averageQuestions.toFixed(1)} soru</span>
              </>
            )}
          </div>
        </div>

        {/* Show grouped subjects */}
        {subject.isGroup && subject.groupSubjects && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="text-xs text-gray-600 font-semibold mb-2">Grup İçeriği:</div>
            <div className="flex flex-wrap gap-1">
              {subject.groupSubjects.slice(0, 4).map((groupSubject: string) => (
                <span key={groupSubject} className="text-xs bg-white px-2 py-1 rounded border">
                  {groupSubject.length > 12 ? `${groupSubject.substring(0, 12)}...` : groupSubject}
                </span>
              ))}
              {subject.groupSubjects.length > 4 && (
                <span className="text-xs bg-white px-2 py-1 rounded border">
                  +{subject.groupSubjects.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 