export type ApiResponseType = {
  urls: Array<{
    url: string;
    timestamp: string;
  }>;
};

export type DataItemType = {
  startTime: Date;
  endTime: Date;
  url: string;
};

export type GroupedDataType = {
  [key: string]: Array<{
    url: string;
    domain: string;
    instances: DataItemType[];
    totalDuration: number;
  }>;
};
