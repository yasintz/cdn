import React from 'react';
import { useStore } from '../../useStore';
import { ImportantSubjectsProps, SubjectGroup } from './types';
import { 
  useSubjectGroups, 
  useSubjectData, 
  useModalState, 
  useEventHandlers 
} from './hooks';
import { 
  EmptyState,
  Header,
  SubjectGroupsManagement,
  StatisticsCards,
  LessonCard,
  SubjectGroupModal,
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
  const { subjectGroups, saveGroup, deleteGroup } = useSubjectGroups();
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

  // Event handlers
  const eventHandlers = useEventHandlers({
    saveGroup,
    deleteGroup,
    openGroupModal: modalState.openGroupModal,
    closeGroupModal: modalState.closeGroupModal,
    openSubjectDetailModal: modalState.openSubjectDetailModal
  });

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
        onCreateGroup={eventHandlers.handleCreateGroup}
      />

      {/* Subject Groups Management */}
      <SubjectGroupsManagement
        subjectGroups={subjectGroups}
        onEditGroup={eventHandlers.handleEditGroup}
        onDeleteGroup={eventHandlers.handleDeleteGroup}
      />

      {/* Statistics Cards */}
      <StatisticsCards 
        examCount={examCount} 
        viewData={viewData} 
        subjectGroups={subjectGroups} 
      />

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson}
            lesson={lesson}
            subjects={getSubjectsForLesson(lesson)}
            maxValue={maxValue}
            viewData={viewData}
            examCount={examCount}
            subjectGroups={subjectGroups}
            onSubjectClick={eventHandlers.handleSubjectClick}
            onEditGroup={eventHandlers.handleEditGroup}
            onDeleteGroup={eventHandlers.handleDeleteGroup}
          />
        ))}
      </div>

      {/* Analysis Information */}
      <AnalysisInfo selectedView={selectedView} />

      {/* Subject Group Modal */}
      <SubjectGroupModal
        isOpen={modalState.isGroupModalOpen}
        onClose={modalState.closeGroupModal}
        onSave={(groupData: Omit<SubjectGroup, 'id' | 'createdAt'>) => 
          eventHandlers.handleSaveGroup(groupData, modalState.editingGroup)
        }
        editingGroup={modalState.editingGroup}
        availableSubjects={availableSubjects}
      />

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