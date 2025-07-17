import React from 'react';
import { LessonCardProps } from '../types';
import { getBorderColor } from '../utils/subjectDataUtils';
import { lessonColors, lessonIcons } from '../constants';
import { SubjectCard } from './SubjectCard';

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  subjects,
  maxValue,
  viewData,
  examCount,
  subjectGroups,
  onSubjectClick,
  onEditGroup,
  onDeleteGroup
}) => {
  if (subjects.length === 0) return null;

  return (
    <div 
      className={`bg-white rounded-2xl p-0 shadow-xl border-4 ${getBorderColor(lesson)} overflow-hidden transition-all duration-300 hover:shadow-2xl relative`}
    >
      {/* Card Header */}
      <div className={`${lessonColors[lesson]} p-6 border-b-2 ${getBorderColor(lesson)}/20 relative`}>
        <div className="absolute top-4 right-4 text-5xl opacity-10">
          {lessonIcons[lesson]}
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">
            {lessonIcons[lesson]}
          </span>
          <h3 className="text-xl font-bold text-gray-800">
            {lesson}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{viewData.icon}</span>
          <span>{subjects.length} konu gösteriliyor</span>
        </div>
      </div>

      {/* Subjects List */}
      <div className="p-6">
        <div className="flex flex-col gap-4">
          {subjects.map((subject, index) => (
            <SubjectCard
              key={`${subject.className}-${subject.subject}-${subject.isGroup ? 'group' : 'regular'}`}
              subject={subject}
              index={index}
              maxValue={maxValue}
              viewData={viewData}
              lesson={lesson}
              examCount={examCount}
              subjectGroups={subjectGroups}
              onSubjectClick={onSubjectClick}
              onEditGroup={onEditGroup}
              onDeleteGroup={onDeleteGroup}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 