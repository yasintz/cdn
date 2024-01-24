/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash';
import { UserAnswer, dersler } from './modules/helpers';
import { parseExam } from './modules/parseExam';

export function newImpl(list: ReturnType<typeof parseExam>[]) {
  const exams = list.map((i) => i.examResponse);

  function totalAnswersCount() {
    const response: {
      [lesson: string]: Record<UserAnswer, number> & {
        Total: number;
        Net: number;
        SuccessRate: number;
      };
    } = {};
    exams.forEach((exam) => {
      Object.entries(exam).forEach(([lesson, lessonData]) => {
        response[lesson] = response[lesson] || {
          [UserAnswer.False]: 0,
          [UserAnswer.True]: 0,
          [UserAnswer.Skip]: 0,
        };
        const data = response[lesson];
        Object.values(lessonData).forEach((subjectAnswers) => {
          subjectAnswers.forEach((answer) => {
            data[answer] = data[answer] || 0;
            data[answer] += 1;
          });
        });
      });
    });

    response.Total = {
      [UserAnswer.True]: Object.values(response).reduce(
        (acc, cur) => acc + cur[UserAnswer.True],
        0
      ),
      [UserAnswer.False]: Object.values(response).reduce(
        (acc, cur) => acc + cur[UserAnswer.False],
        0
      ),
      [UserAnswer.Skip]: Object.values(response).reduce(
        (acc, cur) => acc + cur[UserAnswer.Skip],
        0
      ),
    } as any;

    Object.values(response).forEach((data) => {
      const removedTrueCount = data[UserAnswer.False] / 4;
      const net = data[UserAnswer.True] - removedTrueCount;

      data.Net = net;
      const totalQuestionCount = Object.values(data).reduce(
        (acc, cur) => acc + cur
      );
      data.Total = totalQuestionCount;
      data.SuccessRate = net / totalQuestionCount;
    });

    return Object.entries(response).map(([lesson, data]) => ({ lesson, data }));
  }

  function getSubjectStats(answer?: UserAnswer) {
    const subjectCounts: Record<
      string,
      {
        total: number;
        matched: number;
        className: string;
        subject: string;
      }
    > = {};

    exams.forEach((exam) => {
      Object.entries(exam).forEach(([className, classData]) => {
        Object.entries(classData).forEach(([subjectName, subjectData]) => {
          const key = `${className}_${subjectName}`;
          let data = subjectCounts[key];
          if (!data) {
            data = {
              total: 0,
              matched: 0,
              className,
              subject: subjectName,
            };
            subjectCounts[key] = data;
          }

          const count = subjectData.length;
          data.total += count;
          data.matched += subjectData.filter((a) => a === answer).length;
        });
      });
    });

    const inAllClass = Object.values(subjectCounts);

    inAllClass.sort((a, b) => b.total - a.total);

    return inAllClass;
  }

  const subjectStats = getSubjectStats();

  function getSubjectCounts() {
    const inAllClass = subjectStats;

    const byClass = _.groupBy(inAllClass, 'className');

    return { inAllClass, byClass };
  }

  function getTopSubjects(answer: UserAnswer) {
    const subjectStats = getSubjectStats(answer);

    const averageRates = subjectStats
      .filter(({ matched }) => matched !== 0)
      .map((stats) => ({
        ...stats,
        rate: stats.matched / stats.total,
      }));

    return _.orderBy(averageRates, ['rate'], ['desc']);
  }

  const subjectCounts = getSubjectCounts();

  const importantSubjects = {
    subjectCounts,
  };

  const questionCountPerExam = 120;
  const examCount = exams.length;
  const answerCounts = totalAnswersCount();

  const lessonBasedData = answerCounts
    .map((item) => {
      const count =
        dersler.find((i) => i.name === item.lesson)?.count ||
        questionCountPerExam;

      return {
        ...item,
        skipRate: item.data[UserAnswer.Skip] / examCount / count,
        falseRate: item.data[UserAnswer.False] / examCount / count,
        count,
      };
    })
    .filter((i) => i.lesson !== 'Total');

  return {
    examCount,
    importantSubjects,
    analytics: {
      lessonBasedData,
      subjectBasedData: {
        [UserAnswer.Skip]: getTopSubjects(UserAnswer.Skip),
        [UserAnswer.False]: getTopSubjects(UserAnswer.False),
      },
      answerCounts: answerCounts.map((item) => ({
        ...item,
        count:
          dersler.find((i) => i.name === item.lesson)?.count ||
          questionCountPerExam,
      })),
    },
  };
}
