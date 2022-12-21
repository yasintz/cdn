export const sudoku = require('./sudoku').sudoku;
var sass = require('node-sass');

export const scssToCss = (s: string) => {
  var result = sass.renderSync({
    data: s,
  });
  return result.css.toString('utf-8');
};

export function css(strings: TemplateStringsArray, ...values: any[]) {
  let scssStr = '';

  for (let i = 0; i < strings.length; i++) {
    if (i > 0) {
      scssStr += values[i - 1];
    }
    scssStr += strings[i];
  }

  return scssToCss(scssStr);
}

export var boards = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
  veryHard: 'very-hard',
  insane: 'insane',
  inhuman: 'inhuman',
} as const;

type NumberType = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type BlankType = '.';
type SudokuItemType = NumberType | BlankType;

type SudokuRowType = SudokuItemType[];
export type SudokuType = SudokuRowType[];
