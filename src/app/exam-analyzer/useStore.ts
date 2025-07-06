import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import _debounce from 'lodash/debounce';
import _orderBy from 'lodash/orderBy';
import { parseExam } from './modules/parseExam';
import { gSheetStorageDeprecated } from '@/utils/zustand/gsheet-storage';

type StoreType = {
  exams: ReturnType<typeof parseExam>[];
  addExam: (exam: ReturnType<typeof parseExam>) => void;
  updateExam: (id: string, exam: ReturnType<typeof parseExam>) => void;
  deleteExam: (id: string) => void;
};

export const useStore = create(
  persist<StoreType>(
    (set) => ({
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
    }),
    {
      name: 'smy_exams',
      storage: createJSONStorage(() => gSheetStorageDeprecated('137864714')),
    }
  )
);
