import { UserAnswer } from '../../modules/helpers';
import { newImpl } from '../../new';
import { parseExam } from '../../modules/parseExam';

export interface ImportantSubjectsProps {
  data: ReturnType<typeof newImpl>;
}

export type ViewType = 'frequency' | 'mistakes' | 'empty';

export interface SubjectGroup {
  id: string;
  name: string;
  lesson: string;
  subjects: string[];
  createdAt: number;
}

export interface SubjectData {
  subject: string;
  className: string;
  total?: number;
  rate?: number;
  displayValue: number;
  progressValue: number;
  isGroup: boolean;
  groupId?: string;
  groupSubjects?: string[];
}

export interface SubjectGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Omit<SubjectGroup, 'id' | 'createdAt'>) => void;
  editingGroup?: SubjectGroup | null;
  availableSubjects: { [lesson: string]: string[] };
}

export interface SubjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  lessonName: string;
  exams: ReturnType<typeof parseExam>[];
  examCount: number;
}

export interface QuestionDetail {
  examId: string;
  questionNumber: string;
  questionText: string;
  rightAnswer: string;
  givenAnswer: string;
  answer: UserAnswer;
}

export interface ExamDetail {
  examId: string;
  questions: QuestionDetail[];
  correctCount: number;
  wrongCount: number;
  skipCount: number;
  totalCount: number;
  successRate: number;
}

export interface ViewData {
  title: string;
  icon: string;
  description: string;
  data: any[];
  valueKey: 'rate' | 'total';
  valueLabel: string;
  formatValue: (value: number) => string;
  color: string;
  colorClass: string;
}

export interface SubjectCardProps {
  subject: SubjectData;
  index: number;
  maxValue: number;
  viewData: ViewData;
  lesson: string;
  examCount: number;
  subjectGroups: SubjectGroup[];
  onSubjectClick: (subjectName: string, lessonName: string) => void;
  onEditGroup: (group: SubjectGroup) => void;
  onDeleteGroup: (groupId: string) => void;
}

export interface LessonCardProps {
  lesson: string;
  subjects: SubjectData[];
  maxValue: number;
  viewData: ViewData;
  examCount: number;
  subjectGroups: SubjectGroup[];
  onSubjectClick: (subjectName: string, lessonName: string) => void;
  onEditGroup: (group: SubjectGroup) => void;
  onDeleteGroup: (groupId: string) => void;
}

export interface StatisticsCardsProps {
  examCount: number;
  viewData: ViewData;
  subjectGroups: SubjectGroup[];
} 