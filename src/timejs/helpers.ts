export type UserTimezoneType = {
  timezoneId: string;
  timezoneList: Array<{
    id: string;
    timezoneId: string;
    title: string;
  }>;
};

export type TimezoneItemType = {
  id: string;
  timezone: string;
  offset: number;
  text: string;
};
