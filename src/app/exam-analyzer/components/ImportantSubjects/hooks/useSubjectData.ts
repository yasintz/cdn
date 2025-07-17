import { useState, useMemo } from 'react';
import { ViewType, SubjectGroup, SubjectData, ViewData } from '../types';
import { 
  getViewData, 
  getSubjectsByLesson, 
  getLessons,
  getAvailableSubjects 
} from '../utils/subjectDataUtils';

interface UseSubjectDataProps {
  importantSubjects: any;
  analytics: any;
  examCount: number;
  subjectGroups: SubjectGroup[];
}

export const useSubjectData = ({ 
  importantSubjects, 
  analytics, 
  examCount, 
  subjectGroups 
}: UseSubjectDataProps) => {
  const [selectedView, setSelectedView] = useState<ViewType>('frequency');
  const [subjectCount, setSubjectCount] = useState<number>(5);

  // Get available subjects for each lesson
  const availableSubjects = useMemo(() => {
    return getAvailableSubjects(importantSubjects);
  }, [importantSubjects]);

  // Get view data based on selected view
  const viewData: ViewData = useMemo(() => {
    return getViewData(selectedView, importantSubjects, analytics, examCount);
  }, [selectedView, importantSubjects, analytics, examCount]);

  // Get lessons list
  const lessons = useMemo(() => getLessons(), []);

  // Get subjects by lesson with memoization
  const getSubjectsForLesson = (lesson: string): SubjectData[] => {
    return getSubjectsByLesson(
      lesson, 
      selectedView, 
      viewData, 
      importantSubjects, 
      subjectGroups, 
      examCount, 
      subjectCount
    );
  };

  // Calculate max value for progress bars
  const maxValue = useMemo(() => {
    const allSubjects = lessons.flatMap(lesson => getSubjectsForLesson(lesson));
    return Math.max(...allSubjects.map(s => s.progressValue || 0));
  }, [lessons, selectedView, viewData, subjectGroups, subjectCount]);

  // Helper to get total question count for a subject
  const getSubjectTotalCount = (subjectName: string, lessonName: string): number => {
    const frequencyData = lessonName === 'Tum Dersler'
      ? importantSubjects.subjectCounts.inAllClass
      : importantSubjects.subjectCounts.byClass[lessonName] || [];
    
    const subjectData = frequencyData.find((s: any) => s.subject === subjectName);
    return subjectData?.total || 0;
  };

  return {
    selectedView,
    setSelectedView,
    subjectCount,
    setSubjectCount,
    viewData,
    lessons,
    availableSubjects,
    getSubjectsForLesson,
    maxValue,
    getSubjectTotalCount
  };
}; 