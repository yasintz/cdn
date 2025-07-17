import { useCallback } from 'react';
import { SubjectGroup } from '../types';

interface UseEventHandlersProps {
  saveGroup: (groupData: Omit<SubjectGroup, 'id' | 'createdAt'>, editingGroup?: SubjectGroup | null) => void;
  deleteGroup: (groupId: string) => void;
  openGroupModal: (group?: SubjectGroup) => void;
  closeGroupModal: () => void;
  openSubjectDetailModal: (subjectName: string, lessonName: string) => void;
}

export const useEventHandlers = ({
  saveGroup,
  deleteGroup,
  openGroupModal,
  closeGroupModal,
  openSubjectDetailModal
}: UseEventHandlersProps) => {
  
  const handleCreateGroup = useCallback(() => {
    openGroupModal();
  }, [openGroupModal]);

  const handleEditGroup = useCallback((group: SubjectGroup) => {
    openGroupModal(group);
  }, [openGroupModal]);

  const handleSaveGroup = useCallback((
    groupData: Omit<SubjectGroup, 'id' | 'createdAt'>, 
    editingGroup?: SubjectGroup | null
  ) => {
    saveGroup(groupData, editingGroup);
    closeGroupModal();
  }, [saveGroup, closeGroupModal]);

  const handleDeleteGroup = useCallback((groupId: string) => {
    deleteGroup(groupId);
  }, [deleteGroup]);

  const handleSubjectClick = useCallback((subjectName: string, lessonName: string) => {
    openSubjectDetailModal(subjectName, lessonName);
  }, [openSubjectDetailModal]);

  return {
    handleCreateGroup,
    handleEditGroup,
    handleSaveGroup,
    handleDeleteGroup,
    handleSubjectClick
  };
}; 