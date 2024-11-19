import { Exome } from 'exome';

// export type TaskType = {
//   id: string;
//   projectId?: string;
//   text: string;
//   date: string;
//   completed: boolean;
//   note?: string;
//   blocked?: boolean;
//   reference?: string;
//   startTime: number;
// };

export class TaskStore extends Exome {
  id = '';
  projectId = '';
  title = '';
  date = '';
  startTime = 0;
  endTime = 0;
  priceHr = 0;
}

export class TasksStore extends Exome {}
