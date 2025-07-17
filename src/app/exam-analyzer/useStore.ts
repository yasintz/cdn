import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import _debounce from 'lodash/debounce';
import _orderBy from 'lodash/orderBy';
import { parseExam } from './modules/parseExam';
import { gSheetStorageDeprecated } from '@/utils/zustand/gsheet-storage';

export interface SubjectGroup {
  id: string;
  name: string;
  lesson: string;
  subjects: string[];
  createdAt: number;
}

type StoreType = {
  exams: ReturnType<typeof parseExam>[];
  addExam: (exam: ReturnType<typeof parseExam>) => void;
  updateExam: (id: string, exam: ReturnType<typeof parseExam>) => void;
  deleteExam: (id: string) => void;
  
  // Subject Groups
  subjectGroups: SubjectGroup[];
  addSubjectGroup: (group: Omit<SubjectGroup, 'id' | 'createdAt'>) => void;
  updateSubjectGroup: (id: string, group: Omit<SubjectGroup, 'id' | 'createdAt'>) => void;
  deleteSubjectGroup: (id: string) => void;
  getSubjectGroupById: (id: string) => SubjectGroup | null;
  getSubjectsInGroups: () => string[];
  getGroupForSubject: (subjectName: string) => SubjectGroup | null;
  isSubjectInGroup: (subjectName: string) => boolean;
  validateSubjectGroupData: (groupData: Omit<SubjectGroup, 'id' | 'createdAt'>, editingGroupId?: string) => string[];
  saveSubjectGroup: (groupData: Omit<SubjectGroup, 'id' | 'createdAt'>, editingGroup?: SubjectGroup | null) => void;
};

export const useStore = create(
  persist<StoreType>(
    (set, get) => ({
      exams: [],
      addExam: (exam) => set((prev) => ({ exams: prev.exams.concat(exam) })),
      updateExam: (id, updatedExam) => 
        set((prev) => ({
          exams: prev.exams.map((exam) => 
            exam.id === id ? updatedExam : exam
          )
        })),
      deleteExam: (id) => 
        set((prev) => ({
          exams: prev.exams.filter((exam) => exam.id !== id)
        })),
      
      // Subject Groups state and actions
      subjectGroups: [],
      
      addSubjectGroup: (groupData) => {
        const newGroup: SubjectGroup = {
          ...groupData,
          id: Date.now().toString(),
          createdAt: Date.now()
        };
        set((prev) => ({ 
          subjectGroups: [...prev.subjectGroups, newGroup] 
        }));
      },
      
      updateSubjectGroup: (id, groupData) => {
        set((prev) => ({
          subjectGroups: prev.subjectGroups.map((group) => 
            group.id === id ? { ...group, ...groupData } : group
          )
        }));
      },
      
      deleteSubjectGroup: (id) => {
        set((prev) => ({
          subjectGroups: prev.subjectGroups.filter((group) => group.id !== id)
        }));
      },
      
      getSubjectGroupById: (id) => {
        const { subjectGroups } = get();
        return subjectGroups.find(group => group.id === id) || null;
      },
      
      getSubjectsInGroups: () => {
        const { subjectGroups } = get();
        return subjectGroups.flatMap(group => group.subjects);
      },
      
      getGroupForSubject: (subjectName) => {
        const { subjectGroups } = get();
        return subjectGroups.find(group => group.subjects.includes(subjectName)) || null;
      },
      
      isSubjectInGroup: (subjectName) => {
        const { getSubjectsInGroups } = get();
        return getSubjectsInGroups().includes(subjectName);
      },
      
      validateSubjectGroupData: (groupData, editingGroupId) => {
        const { subjectGroups } = get();
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
      },
      
      saveSubjectGroup: (groupData, editingGroup) => {
        const { validateSubjectGroupData, addSubjectGroup, updateSubjectGroup } = get();
        
        // Validate the group data
        const errors = validateSubjectGroupData(groupData, editingGroup?.id);
        if (errors.length > 0) {
          throw new Error(errors[0]);
        }

        if (editingGroup) {
          // Update existing group
          updateSubjectGroup(editingGroup.id, groupData);
        } else {
          // Create new group
          addSubjectGroup(groupData);
        }
      },
    }),
    {
      name: 'smy_exams',
      storage: createJSONStorage(() => gSheetStorageDeprecated('137864714')),
    }
  )
);
