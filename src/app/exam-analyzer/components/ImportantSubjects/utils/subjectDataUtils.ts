import { UserAnswer } from '../../../modules/helpers';
import { dersler } from '../../../modules/helpers';
import { parseExam } from '../../../modules/parseExam';
import { 
  SubjectData, 
  ViewType, 
  ViewData, 
  QuestionDetail, 
  ExamDetail 
} from '../types';
import { viewTypeConfig, borderColors } from '../constants';
import { SubjectGroup } from '@/app/exam-analyzer/useStore';

export const getLessons = () => [...dersler.map((i) => i.name), 'Tum Dersler'];

export const getBorderColor = (lesson: string): string => {
  return borderColors[lesson] || 'border-gray-500';
};

export const getIntensityColor = (value: number, maxValue: number): string => {
  const ratio = value / maxValue;
  if (ratio >= 0.8) return 'text-red-700';
  if (ratio >= 0.6) return 'text-orange-600';
  if (ratio >= 0.4) return 'text-yellow-600';
  if (ratio >= 0.2) return 'text-green-600';
  return 'text-green-700';
};

export const getAnswerIcon = (answer: UserAnswer): string => {
  switch (answer) {
    case UserAnswer.True: return '✅';
    case UserAnswer.False: return '❌';
    case UserAnswer.Skip: return '⭕';
    case UserAnswer.Cancel: return '🚫';
    default: return '❓';
  }
};

export const getAnswerColor = (answer: UserAnswer): string => {
  switch (answer) {
    case UserAnswer.True: return 'text-green-600 bg-green-50';
    case UserAnswer.False: return 'text-red-600 bg-red-50';
    case UserAnswer.Skip: return 'text-gray-600 bg-gray-50';
    case UserAnswer.Cancel: return 'text-orange-600 bg-orange-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const getAvailableSubjects = (importantSubjects: any): { [lesson: string]: string[] } => {
  const availableSubjects: { [lesson: string]: string[] } = {};
  
  Object.keys(importantSubjects.subjectCounts.byClass).forEach(lesson => {
    const subjects: string[] = importantSubjects.subjectCounts.byClass[lesson]
      ?.map((item: any) => item.subject)
      .filter((subject: any): subject is string => Boolean(subject)) || [];
    availableSubjects[lesson] = [...new Set(subjects)];
  });
  
  return availableSubjects;
};

export const getSubjectTotalCount = (
  subjectName: string, 
  lessonName: string, 
  importantSubjects: any
): number => {
  const frequencyData = lessonName === 'Tum Dersler'
    ? importantSubjects.subjectCounts.inAllClass
    : importantSubjects.subjectCounts.byClass[lessonName] || [];
  
  const subjectData = frequencyData.find((s: any) => s.subject === subjectName);
  return subjectData?.total || 0;
};

export const calculateGroupData = (
  group: SubjectGroup,
  selectedView: ViewType,
  importantSubjects: any,
  analytics: any,
  examCount: number
): SubjectData | null => {
  const { subjects: groupSubjects, name: groupName, lesson: groupLesson, id: groupId } = group;
  
  // Common base properties for the return object
  const baseGroupData = {
    subject: groupName,
    className: groupLesson,
    isGroup: true,
    groupId,
    groupSubjects
  };

  if (selectedView === 'frequency') {
    return calculateFrequencyGroupData(groupSubjects, groupLesson, examCount, importantSubjects, baseGroupData);
  }

  return calculateAnalyticsGroupData(groupSubjects, groupLesson, selectedView, analytics, baseGroupData);
};

const calculateFrequencyGroupData = (
  groupSubjects: string[],
  groupLesson: string,
  examCount: number,
  importantSubjects: any,
  baseGroupData: Partial<SubjectData>
): SubjectData => {
  const lessonData = importantSubjects.subjectCounts.byClass[groupLesson] || [];
  const relevantSubjects = lessonData.filter((item: any) => groupSubjects.includes(item.subject));
  
  const totalQuestions = relevantSubjects.reduce((sum: number, item: any) => sum + item.total, 0);
  const avgPerExam = totalQuestions / examCount;
  
  return {
    ...baseGroupData,
    total: totalQuestions,
    rate: avgPerExam,
    displayValue: Math.round(avgPerExam),
    progressValue: totalQuestions
  } as SubjectData;
};

const calculateAnalyticsGroupData = (
  groupSubjects: string[],
  groupLesson: string,
  selectedView: ViewType,
  analytics: any,
  baseGroupData: Partial<SubjectData>
): SubjectData | null => {
  const analyticsKey = selectedView === 'mistakes' ? UserAnswer.False : UserAnswer.Skip;
  const analyticsData = analytics.subjectBasedData?.[analyticsKey] || [];
  
  const relevantSubjects = analyticsData.filter((item: any) => 
    item.className === groupLesson && groupSubjects.includes(item.subject)
  );
  
  if (relevantSubjects.length === 0) {
    return null;
  }
  
  const avgRate = relevantSubjects.reduce((sum: number, item: any) => sum + item.rate, 0) / relevantSubjects.length;
  
  return {
    ...baseGroupData,
    rate: avgRate,
    displayValue: avgRate,
    progressValue: avgRate
  } as SubjectData;
};

export const getViewData = (
  selectedView: ViewType,
  importantSubjects: any,
  analytics: any,
  examCount: number
): ViewData => {
  const config = viewTypeConfig[selectedView];
  
  switch (selectedView) {
    case 'mistakes':
      return {
        ...config,
        data: analytics.subjectBasedData[UserAnswer.False] || [],
        valueKey: 'rate' as const,
        formatValue: (value: number) => `%${(value * 100).toFixed(1)}`
      };
    case 'empty':
      return {
        ...config,
        data: analytics.subjectBasedData[UserAnswer.Skip] || [],
        valueKey: 'rate' as const,
        formatValue: (value: number) => `%${(value * 100).toFixed(1)}`
      };
    default:
      return {
        ...config,
        data: Object.values(importantSubjects.subjectCounts.inAllClass).map((subject: any) => ({
          ...subject,
          rate: subject.total / examCount
        })),
        valueKey: 'total' as const,
        formatValue: (value: number) => `${Math.round(value / examCount)}x`
      };
  }
};

export const getSubjectsByLesson = (
  lesson: string,
  selectedView: ViewType,
  viewData: ViewData,
  importantSubjects: any,
  subjectGroups: SubjectGroup[],
  examCount: number,
  subjectCount: number,
  analytics?: any
): SubjectData[] => {
  let regularSubjects: SubjectData[] = [];
  let groupSubjects: SubjectData[] = [];

  // Get all subjects that are included in groups
  const subjectsInGroups = subjectGroups.flatMap(group => group.subjects);

  // Get regular subjects (excluding those that are in groups)
  if (selectedView === 'frequency') {
    const subjects = (lesson === 'Tum Dersler'
      ? importantSubjects.subjectCounts.inAllClass
      : importantSubjects.subjectCounts.byClass[lesson]
    )?.filter((i: any) => i.subject && !subjectsInGroups.includes(i.subject)) || [];
    
    regularSubjects = subjects.map((subject: any) => ({
      ...subject,
      rate: subject.total / examCount,
      displayValue: Math.round(subject.total / examCount),
      progressValue: subject.total,
      isGroup: false
    }));
  } else {
    const allSubjects = viewData.data.filter((subject: any) => 
      (lesson === 'Tum Dersler' || subject.className === lesson) &&
      !subjectsInGroups.includes(subject.subject)
    );
    
    regularSubjects = allSubjects.map((subject: any) => {
      const totalCount = getSubjectTotalCount(subject.subject, subject.className, importantSubjects);
      return {
        ...subject,
        total: totalCount,
        displayValue: subject.rate,
        progressValue: subject.rate,
        isGroup: false
      };
    });
  }

  // Get subject groups for this lesson
  const lessonGroups = lesson === 'Tum Dersler' 
    ? subjectGroups 
    : subjectGroups.filter(group => group.lesson === lesson);

  groupSubjects = lessonGroups
    .map(group => calculateGroupData(group, selectedView, importantSubjects, analytics, examCount))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  // Combine regular subjects and group subjects
  const allSubjects = [...regularSubjects, ...groupSubjects];
  
  // Sort by the appropriate metric based on selected view
  const sortedSubjects = allSubjects
    .sort((a, b) => {
      if (selectedView === 'frequency') {
        const avgA = (a.total || 0) / examCount;
        const avgB = (b.total || 0) / examCount;
        return avgB - avgA;
      } else {
        // For mistakes and empty views, sort by rate
        return (b.rate || 0) - (a.rate || 0);
      }
    })
    .slice(0, subjectCount);

  return sortedSubjects;
};

export const getSubjectDetails = (
  subjectName: string,
  lessonName: string,
  exams: ReturnType<typeof parseExam>[]
): { examDetails: ExamDetail[], allQuestions: QuestionDetail[], stats: any } => {
  const examDetails: ExamDetail[] = [];
  const allQuestions: QuestionDetail[] = [];

  exams.forEach(exam => {
    const examQuestions: QuestionDetail[] = [];
    
    if (exam.examResponse[lessonName] && exam.examResponse[lessonName][subjectName]) {
      const answers = exam.examResponse[lessonName][subjectName];
      
      if (exam.sinav[lessonName]) {
        Object.entries(exam.sinav[lessonName]).forEach(([questionNumber, questionData]: [string, any]) => {
          if (questionData.question === subjectName) {
            const questionDetail: QuestionDetail = {
              examId: exam.id,
              questionNumber,
              questionText: questionData.question,
              rightAnswer: questionData.rightAnswer,
              givenAnswer: questionData.givenAnswer,
              answer: questionData.answer
            };
            examQuestions.push(questionDetail);
            allQuestions.push(questionDetail);
          }
        });
      }
      
      if (examQuestions.length === 0) {
        answers.forEach((answer: UserAnswer, index: number) => {
          const questionDetail: QuestionDetail = {
            examId: exam.id,
            questionNumber: `${index + 1}`,
            questionText: subjectName,
            rightAnswer: '-',
            givenAnswer: '-',
            answer: answer
          };
          examQuestions.push(questionDetail);
          allQuestions.push(questionDetail);
        });
      }
    }

    if (examQuestions.length > 0) {
      const correctCount = examQuestions.filter(q => q.answer === UserAnswer.True).length;
      const wrongCount = examQuestions.filter(q => q.answer === UserAnswer.False).length;
      const skipCount = examQuestions.filter(q => q.answer === UserAnswer.Skip).length;
      const totalCount = examQuestions.length;

      examDetails.push({
        examId: exam.id,
        questions: examQuestions,
        correctCount,
        wrongCount,
        skipCount,
        totalCount,
        successRate: totalCount > 0 ? correctCount / totalCount : 0
      });
    }
  });

  const totalQuestions = allQuestions.length;
  const totalCorrect = allQuestions.filter(q => q.answer === UserAnswer.True).length;
  const totalWrong = allQuestions.filter(q => q.answer === UserAnswer.False).length;
  const totalSkip = allQuestions.filter(q => q.answer === UserAnswer.Skip).length;
  
  const stats = {
    totalQuestions,
    totalCorrect,
    totalWrong,
    totalSkip,
    averageQuestionsPerExam: examDetails.length > 0 ? totalQuestions / examDetails.length : 0,
    successRate: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
    errorRate: totalQuestions > 0 ? totalWrong / totalQuestions : 0,
    skipRate: totalQuestions > 0 ? totalSkip / totalQuestions : 0,
    appearsInExams: examDetails.length
  };

  return { examDetails, allQuestions, stats };
}; 