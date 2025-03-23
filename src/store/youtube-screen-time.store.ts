import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { Exome } from 'exome';
import { useStore } from 'exome/react';

class YoutubeScreenDayTime extends Exome {
  time = '';

  usageMs = 0;

  paid = false;
}

export class YoutubeScreenTimeStore extends Exome {
  usageByDay: YoutubeScreenDayTime[] = [];

  payDay(day: string) {
    const item = this.usageByDay.find((item) => item.time === day);
    if (item) {
      item.paid = true;
    }
  }
}

const youtubeScreenTimeStore = new YoutubeScreenTimeStore();

export const useYoutubeScreenTimeStore = () => useStore(youtubeScreenTimeStore);

gSheetStorage(
  'Youtube Screen Time',
  '1JeVT003trtmuaClasTbVvXOFSqAECSDc-Gg9wmPiq0I'
).handleExome(youtubeScreenTimeStore, (s) => ({
  ...s,
  usageByDay: s.usageByDay.map((item: any) =>
    Object.assign(new YoutubeScreenDayTime(), item)
  ),
}));
