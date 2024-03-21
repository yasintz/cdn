import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import _debounce from 'lodash/debounce';
import _orderBy from 'lodash/orderBy';
import { parseExam } from './modules/parseExam';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';

type StoreType = {
  exams: ReturnType<typeof parseExam>[];
  addExam: (exam: ReturnType<typeof parseExam>) => void;
};

export const useStore = create(
  persist<StoreType>(
    (set) => ({
      exams: [],
      addExam: (exam) => set((prev) => ({ exams: prev.exams.concat(exam) })),
    }),
    {
      name: 'smy_exams',
      storage: createJSONStorage(() => gSheetStorage('137864714')),
    }
  )
);
