import dayjs from '@/helpers/dayjs';
import { create } from 'zustand';
import { SIMPLE_TODO_DATE_FORMAT } from '../store/utils';

type SharedStore = {
  selectedDate: string;
  showAllTodos: boolean;
  setSharedState: (state: Partial<SharedStore>) => void;
};

export const useSharedStore = create<SharedStore>((set) => ({
  selectedDate: dayjs().format(SIMPLE_TODO_DATE_FORMAT),
  showAllTodos: false,
  setSharedState: set,
}));
