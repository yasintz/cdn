import { SubjectData } from '../types';
import { SubjectGroup } from '../../../useStore';

/**
 * Utility functions for subject group management
 */

/**
 * Get all subjects that are currently assigned to groups
 */
export const getSubjectsInGroups = (groups: SubjectGroup[]): string[] => {
  return groups.flatMap(group => group.subjects);
};

/**
 * Check if a subject is already assigned to a group
 */
export const isSubjectInGroup = (subjectName: string, groups: SubjectGroup[]): boolean => {
  return getSubjectsInGroups(groups).includes(subjectName);
};

/**
 * Find the group that contains a specific subject
 */
export const findGroupBySubject = (subjectName: string, groups: SubjectGroup[]): SubjectGroup | null => {
  return groups.find(group => group.subjects.includes(subjectName)) || null;
};

/**
 * Get groups for a specific lesson
 */
export const getGroupsByLesson = (lesson: string, groups: SubjectGroup[]): SubjectGroup[] => {
  if (lesson === 'Tum Dersler') {
    return groups;
  }
  return groups.filter(group => group.lesson === lesson);
};

/**
 * Validate group data before saving
 */
export const validateGroupData = (
  groupData: Omit<SubjectGroup, 'id' | 'createdAt'>,
  existingGroups: SubjectGroup[],
  editingGroupId?: string
): string[] => {
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
  const otherGroups = existingGroups.filter(group => 
    editingGroupId ? group.id !== editingGroupId : true
  );
  
  const subjectsInOtherGroups = getSubjectsInGroups(otherGroups);
  const conflictingSubjects = groupData.subjects.filter(subject => 
    subjectsInOtherGroups.includes(subject)
  );
  
  if (conflictingSubjects.length > 0) {
    errors.push(`Bu konular zaten başka gruplarda bulunuyor: ${conflictingSubjects.join(', ')}`);
  }

  // Check for duplicate group name
  const existingGroupNames = otherGroups.map(group => group.name.toLowerCase());
  if (existingGroupNames.includes(groupData.name.toLowerCase())) {
    errors.push(`"${groupData.name}" adında bir grup zaten mevcut.`);
  }

  return errors;
};

/**
 * Filter subjects to exclude those that are in groups
 */
export const filterSubjectsNotInGroups = (
  subjects: any[],
  groups: SubjectGroup[]
): any[] => {
  const subjectsInGroups = getSubjectsInGroups(groups);
  return subjects.filter(subject => 
    !subjectsInGroups.includes(subject.subject)
  );
};

/**
 * Create a merged list of individual subjects and group subjects for display
 */
export const createMergedSubjectList = (
  individualSubjects: SubjectData[],
  groupSubjects: SubjectData[]
): SubjectData[] => {
  return [...individualSubjects, ...groupSubjects];
};

/**
 * Get group statistics
 */
export const getGroupStatistics = (groups: SubjectGroup[]) => {
  const totalGroups = groups.length;
  const totalSubjectsInGroups = groups.reduce((sum, group) => sum + group.subjects.length, 0);
  
  const lessonDistribution = groups.reduce((acc, group) => {
    acc[group.lesson] = (acc[group.lesson] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostActiveLesson = Object.entries(lessonDistribution).length > 0 
    ? Object.entries(lessonDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : null;

  const averageSubjectsPerGroup = totalGroups > 0 
    ? totalSubjectsInGroups / totalGroups 
    : 0;

  return {
    totalGroups,
    totalSubjectsInGroups,
    lessonDistribution,
    mostActiveLesson,
    averageSubjectsPerGroup
  };
};

/**
 * Generate a unique group ID
 */
export const generateGroupId = (): string => {
  return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sort groups by creation date (newest first)
 */
export const sortGroupsByDate = (groups: SubjectGroup[]): SubjectGroup[] => {
  return [...groups].sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Sort groups by name alphabetically
 */
export const sortGroupsByName = (groups: SubjectGroup[]): SubjectGroup[] => {
  return [...groups].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Search groups by name or subject content
 */
export const searchGroups = (
  groups: SubjectGroup[],
  searchTerm: string
): SubjectGroup[] => {
  if (!searchTerm.trim()) return groups;
  
  const term = searchTerm.toLowerCase();
  return groups.filter(group => 
    group.name.toLowerCase().includes(term) ||
    group.subjects.some(subject => subject.toLowerCase().includes(term))
  );
};

/**
 * Export groups data for backup
 */
export const exportGroupsData = (groups: SubjectGroup[]): string => {
  return JSON.stringify(groups, null, 2);
};

/**
 * Import groups data from backup
 */
export const importGroupsData = (jsonData: string): SubjectGroup[] => {
  try {
    const groups = JSON.parse(jsonData);
    
    // Validate the structure
    if (!Array.isArray(groups)) {
      throw new Error('Invalid data format: Expected array');
    }
    
    groups.forEach((group, index) => {
      if (!group.id || !group.name || !group.lesson || !Array.isArray(group.subjects)) {
        throw new Error(`Invalid group at index ${index}: Missing required fields`);
      }
    });
    
    return groups;
  } catch (error) {
    throw new Error(`Veri içe aktarılırken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
};

/**
 * Get groups that need attention (empty groups, single subject groups, etc.)
 */
export const getGroupsNeedingAttention = (groups: SubjectGroup[]) => {
  const emptyGroups = groups.filter(group => group.subjects.length === 0);
  const singleSubjectGroups = groups.filter(group => group.subjects.length === 1);
  const duplicateNameGroups = groups.filter((group, index, arr) => 
    arr.findIndex(g => g.name.toLowerCase() === group.name.toLowerCase()) !== index
  );

  return {
    emptyGroups,
    singleSubjectGroups,
    duplicateNameGroups,
    hasIssues: emptyGroups.length > 0 || singleSubjectGroups.length > 0 || duplicateNameGroups.length > 0
  };
}; 