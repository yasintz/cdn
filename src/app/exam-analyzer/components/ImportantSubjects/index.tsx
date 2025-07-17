import React from 'react';
import { useStore } from '../../useStore';
import { ImportantSubjectsProps, SubjectGroup } from './types';
import { 
  useSubjectGroups, 
  useSubjectData, 
  useModalState 
} from './hooks';
import { 
  EmptyState,
  Header,
  StatisticsCards,
  LessonCard,
  SubjectDetailModal,
  AnalysisInfo,
  ErrorBoundary
} from './components';

export function ImportantSubjects({
  data: { importantSubjects, examCount, analytics },
}: ImportantSubjectsProps) {
  // Get exams from the store
  const { exams } = useStore();

  // Custom hooks for state management
  const { subjectGroups } = useSubjectGroups();
  const modalState = useModalState();
  
  const {
    selectedView,
    setSelectedView,
    subjectCount,
    setSubjectCount,
    viewData,
    lessons,
    availableSubjects,
    getSubjectsForLesson,
    maxValue
  } = useSubjectData({
    importantSubjects,
    analytics,
    examCount,
    subjectGroups
  });

  // Event handler for subject details
  const handleSubjectClick = (subjectName: string, lessonName: string) => {
    modalState.openSubjectDetailModal(subjectName, lessonName);
  };

  // Early return for empty state
  if (examCount === 0) {
    return <EmptyState />;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Header
        viewData={viewData}
        examCount={examCount}
        selectedView={selectedView}
        onViewChange={setSelectedView}
        subjectCount={subjectCount}
        onSubjectCountChange={setSubjectCount}
      />

      {/* Statistics Cards */}
      <StatisticsCards 
        examCount={examCount} 
        viewData={viewData} 
        subjectGroups={subjectGroups} 
      />

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 gap-8">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson}
            lesson={lesson}
            subjects={getSubjectsForLesson(lesson)}
            maxValue={maxValue}
            viewData={viewData}
            examCount={examCount}
            subjectGroups={subjectGroups}
            onSubjectClick={handleSubjectClick}
          />
        ))}
      </div>

      {/* Analysis Information */}
      <AnalysisInfo selectedView={selectedView} />

      {/* Subject Detail Modal */}
      {modalState.selectedSubject && modalState.selectedLesson && (
        <SubjectDetailModal
          isOpen={modalState.isSubjectDetailModalOpen}
          onClose={modalState.closeSubjectDetailModal}
          subjectName={modalState.selectedSubject}
          lessonName={modalState.selectedLesson}
          exams={exams}
          examCount={examCount}
        />
      )}
      </div>
    </ErrorBoundary>
  );
} 