import { converters, initializeUrlQ } from '@/helpers/initializeUrlQ';

type UrlsStates = {
  selectedEventId: string;
  updateModalClosed: boolean;
};

export const useUrlQ = initializeUrlQ<UrlsStates>(
  {
    selectedEventId: 'selectedEventId',
    updateModalClosed: 'updateModalClosed',
  },
  {
    updateModalClosed: converters.boolean,
  }
);
