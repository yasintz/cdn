import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import _debounce from 'lodash/debounce';
import _orderBy from 'lodash/orderBy';
import { parseExam } from './modules/parseExam';
import { googleSheetDb } from '@/utils/googleSheetDb';

type StoreType = {
  exams: ReturnType<typeof parseExam>[];
  addExam: (exam: ReturnType<typeof parseExam>) => void;
};

const sheetTabId = window.location.href.includes('localhost')
  ? '279534542'
  : '0';

export const useStore = create(
  persist<StoreType>(
    (set) => ({
      exams: [],
      addExam: (exam) => set((prev) => ({ exams: prev.exams.concat(exam) })),
    }),
    {
      name: 'smy_exams',
    }
  )
);

const throttledReSync = _debounce((store: StoreType) => {
  googleSheetDb(sheetTabId).set(JSON.stringify(store));
}, 500);

googleSheetDb(sheetTabId)
  .get()
  .then((res) => {
    const json: StoreType = JSON.parse(res);

    useStore.setState({
      ...json,
      exams: _orderBy(json.exams, (s) => parseInt(s.id, 10)),
    });

    useStore.subscribe(throttledReSync);
  });
