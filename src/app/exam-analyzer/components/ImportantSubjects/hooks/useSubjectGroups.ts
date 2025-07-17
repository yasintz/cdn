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
    // Validate that subjects are not already in other groups
    const subjectsInOtherGroups = subjectGroups
      .filter(group => editingGroup ? group.id !== editingGroup.id : true)
      .flatMap(group => group.subjects);
    
    const conflictingSubjects = groupData.subjects.filter(subject => 
      subjectsInOtherGroups.includes(subject)
    );
    
    if (conflictingSubjects.length > 0) {
      throw new Error(`Bu konular zaten başka gruplarda bulunuyor: ${conflictingSubjects.join(', ')}`);
    }

    // Validate that group name is unique (excluding current group if editing)
    const existingGroupNames = subjectGroups
      .filter(group => editingGroup ? group.id !== editingGroup.id : true)
      .map(group => group.name.toLowerCase());
    
    if (existingGroupNames.includes(groupData.name.toLowerCase())) {
      throw new Error(`"${groupData.name}" adında bir grup zaten mevcut. Lütfen farklı bir isim seçin.`);
    }

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

  const getSubjectsInGroups = () => {
    return subjectGroups.flatMap(group => group.subjects);
  };

  const getGroupForSubject = (subjectName: string) => {
    return subjectGroups.find(group => group.subjects.includes(subjectName)) || null;
  };

  const isSubjectInGroup = (subjectName: string) => {
    return getSubjectsInGroups().includes(subjectName);
  };

  const validateGroupData = (groupData: Omit<SubjectGroup, 'id' | 'createdAt'>, editingGroupId?: string) => {
    const errors: string[] = [];

    // Check for empty name
    if (!groupData.name.trim()) {
      errors.push('Grup adı boş olamaz.');
    }

    // Check for empty subjects
    if (groupData.subjects.length === 0) {
      errors.push('En az bir konu seçmelisiniz.');
    }

    // Check for duplicate subjects within the group
    const uniqueSubjects = [...new Set(groupData.subjects)];
    if (uniqueSubjects.length !== groupData.subjects.length) {
      errors.push('Aynı konu birden fazla kez eklenemez.');
    }

    // Check for subjects already in other groups
    const subjectsInOtherGroups = subjectGroups
      .filter(group => editingGroupId ? group.id !== editingGroupId : true)
      .flatMap(group => group.subjects);
    
    const conflictingSubjects = groupData.subjects.filter(subject => 
      subjectsInOtherGroups.includes(subject)
    );
    
    if (conflictingSubjects.length > 0) {
      errors.push(`Bu konular zaten başka gruplarda bulunuyor: ${conflictingSubjects.join(', ')}`);
    }

    // Check for duplicate group name
    const existingGroupNames = subjectGroups
      .filter(group => editingGroupId ? group.id !== editingGroupId : true)
      .map(group => group.name.toLowerCase());
    
    if (existingGroupNames.includes(groupData.name.toLowerCase())) {
      errors.push(`"${groupData.name}" adında bir grup zaten mevcut.`);
    }

    return errors;
  };

  return {
    subjectGroups,
    saveGroup,
    deleteGroup,
    getGroupById,
    getSubjectsInGroups,
    getGroupForSubject,
    isSubjectInGroup,
    validateGroupData
  };
}; 