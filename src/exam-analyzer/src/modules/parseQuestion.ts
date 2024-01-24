import { UserAnswer } from './helpers';

export function parseQuestion(q: string) {
  let answer = UserAnswer.Invalid;

  let question = q;
  let rightAnswer = '';
  let givenAnswer = '';
  const last2 = question[question.length - 2];
  const last = question[question.length - 1];

  if (question === 'İPTAL') {
    answer = UserAnswer.Cancel;
  } else if (last === '+') {
    answer = UserAnswer.True;
    question = question.substring(0, question.length - 6);
    rightAnswer = q[q.length - 5];
    givenAnswer = q[q.length - 3];
  } else if (last === '-') {
    answer = UserAnswer.False;
    question = question.substring(0, question.length - 6);
    rightAnswer = q[q.length - 5];
    givenAnswer = q[q.length - 3];
  } else if (last2 === ' ' || question.length === 1) {
    question = question.substring(0, question.length - 2);
    answer = UserAnswer.Skip;
    rightAnswer = last;
  }

  return { answer, question, rightAnswer, givenAnswer };
}
