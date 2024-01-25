/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { Results, UserAnswer, dersler } from './helpers';
import { parseQuestion } from './parseQuestion';

export function parseExam(id: string, content: string) {
  const sinav: Record<
    string,
    Record<string, ReturnType<typeof parseQuestion>>
  > = {};

  let list = content.split('No Konu DC ÖC SO ÇZM').join('');

  const lessonsWitoutGeo = dersler.filter((i) => i.name !== 'Geometri');

  for (let index = 0; index < lessonsWitoutGeo.length; index++) {
    const { start, end, name: ders } = lessonsWitoutGeo[index];
    const nextDers =
      index < lessonsWitoutGeo.length - 1
        ? lessonsWitoutGeo[index + 1].name
        : undefined;

    let [current, others] = list.split(`${nextDers}\n`);

    if (index === 0) {
      current = current.split(`${ders}\n`)[1];
    }
    let dersContent = current.split('\n').join(' ').trim();

    const questions: Record<string, any> = {};
    const nArray = Array.from(Array(end - start + 1).keys());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    nArray.forEach((a, index) => {
      const nNumber = index + start;
      const nextNumber = nNumber + 1;

      let [prev, others] = dersContent.split(` ${nextNumber} `);

      if (index === 0) {
        prev = prev.replace(`${nNumber} `, '');
      }

      questions[nNumber] = parseQuestion(prev);
      dersContent = others;
    });

    sinav[ders] = questions;

    list = others;
  }

  const geoKeys = Array.from(Array(10).keys());

  sinav.Geometri = {};

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  geoKeys.forEach((i, index) => {
    const key = index + 30;
    sinav.Geometri[key] = sinav.Matematik[key];
    delete sinav.Matematik[key];
  });

  const examResponse: {
    [lesson: string]: {
      [subject: string]: UserAnswer[];
    };
  } = {};

  Object.entries(sinav).forEach(([ders, dersResult]) => {
    examResponse[ders] = examResponse[ders] || {};
    Object.values(dersResult).forEach((soruResult) => {
      const { answer, question } = soruResult;

      if (question === Results.iptal) {
        return;
      }

      examResponse[ders][question] = examResponse[ders][question] || [];
      examResponse[ders][question].push(answer);
    });
  });

  return { id, examResponse, sinav };
}
