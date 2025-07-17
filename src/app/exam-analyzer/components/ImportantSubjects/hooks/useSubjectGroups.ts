import { useState, useEffect } from 'react';
import { SubjectGroup } from '../types';

export const useSubjectGroups = () => {
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);

  // Load subject groups from localStorage on mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('subjectGroups');
    if (savedGroups) {
      try {
        setSubjectGroups(JSON.parse(savedGroups));
      } catch (error) {
        console.error('Error loading subject groups:', error);
      }
    }
  }, []);

  // Save subject groups to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('subjectGroups', JSON.stringify(subjectGroups));
  }, [subjectGroups]);

  const saveGroup = (groupData: Omit<SubjectGroup, 'id' | 'createdAt'>, editingGroup?: SubjectGroup | null) => {
    if (editingGroup) {
      // Update existing group
      setSubjectGroups(prev => prev.map(group => 
        group.id === editingGroup.id 
          ? { ...group, ...groupData }
          : group
      ));
    } else {
      // Create new group
      const newGroup: SubjectGroup = {
        ...groupData,
        id: Date.now().toString(),
        createdAt: Date.now()
      };
      setSubjectGroups(prev => [...prev, newGroup]);
    }
  };

  const deleteGroup = (groupId: string) => {
    if (confirm('Bu konu grubunu silmek istediğinizden emin misiniz?')) {
      setSubjectGroups(prev => prev.filter(group => group.id !== groupId));
      return true;
    }
    return false;
  };

  const getGroupById = (groupId: string) => {
    return subjectGroups.find(group => group.id === groupId) || null;
  };

  return {
    subjectGroups,
    saveGroup,
    deleteGroup,
    getGroupById
  };
}; 