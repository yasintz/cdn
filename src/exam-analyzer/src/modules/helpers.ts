export enum UserAnswer {
  Cancel = 'İPTAL',
  True = 'True',
  False = 'False',
  Skip = 'Skip',
  Invalid = 'Invalid',
}

/**
 * @deprecated Use UserAnswer
 */
export const Results = {
  iptal: UserAnswer.Cancel,
  dogru: UserAnswer.True,
  yanlis: UserAnswer.False,
  bos: UserAnswer.Skip,
  invalid: UserAnswer.Invalid,
} as const;

export const dersler = [
  {
    start: 1,
    end: 40,
    name: 'Türkçe',
    count: 40,
  },
  { start: 1, end: 40, name: 'Matematik', count: 30 },
  { start: 30, end: 40, name: 'Geometri', count: 10 },
  { start: 1, end: 5, name: 'Tarih', count: 5 },
  { start: 6, end: 10, name: 'Coğrafya', count: 5 },
  { start: 11, end: 15, name: 'Felsefe', count: 5 },
  { start: 16, end: 20, name: 'Din Kültürü', count: 5 },
  { start: 1, end: 7, name: 'Fizik', count: 7 },
  { start: 8, end: 14, name: 'Kimya', count: 7 },
  { start: 15, end: 20, name: 'Biyoloji', count: 6 },
] as const;
