import { useState } from 'react';
import { SubjectGroup } from '../../../useStore';

export const useModalState = () => {
  // Group modal state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SubjectGroup | null>(null);
  
  // Subject detail modal state
  const [isSubjectDetailModalOpen, setIsSubjectDetailModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');

  // Group modal actions
  const openGroupModal = (group?: SubjectGroup) => {
    setEditingGroup(group || null);
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  // Subject detail modal actions
  const openSubjectDetailModal = (subjectName: string, lessonName: string) => {
    setSelectedSubject(subjectName);
    setSelectedLesson(lessonName);
    setIsSubjectDetailModalOpen(true);
  };

  const closeSubjectDetailModal = () => {
    setIsSubjectDetailModalOpen(false);
    setSelectedSubject('');
    setSelectedLesson('');
  };

  return {
    // Group modal
    isGroupModalOpen,
    editingGroup,
    openGroupModal,
    closeGroupModal,
    
    // Subject detail modal
    isSubjectDetailModalOpen,
    selectedSubject,
    selectedLesson,
    openSubjectDetailModal,
    closeSubjectDetailModal
  };
}; 