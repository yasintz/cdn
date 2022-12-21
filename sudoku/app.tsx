import * as React from 'react';
import { css, sudoku, SudokuType } from './utils';
import cx from 'classnames';

const style = css`
  $size: 130px;

  html,
  body {
    padding: 0;
    margin: 0;
  }
  body {
    padding: 100px;
  }
  table {
    border: 10px solid #ddd;
    border-spacing: 0;
  }
  td {
    line-height: 0;
    font-size: 48px;
    width: $size;
    height: $size;
    text-align: center;
    border-right: 5px solid #ddd;
    border-bottom: 5px solid #ddd;
    position: relative;
    &.rightBorder {
      border-right: 10px solid #ddd;
    }
    &.bottomBorder {
      border-bottom: 10px solid #ddd;
    }

    span {
      border-bottom: $size/25 solid #d0d0d0;
    }
  }
  input {
    line-height: 0;
    width: 100%;
    height: 100%;
    border: none;
    text-align: center;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }
`;

const App = ({ board }: { board: SudokuType }) => {


  return (
    <table>
      {board.map((row, rowI) => (
        <tr key={rowI.toString()}>
          {row.map((col, colI) => (
            <td
              className={cx({
                blank: col === sudoku.BLANK_CHAR,
                rightBorder: [2, 5].includes(colI),
                bottomBorder: [2, 5].includes(rowI),
              })}
              key={colI.toString() + rowI.toString()}
            >
              {col === sudoku.BLANK_CHAR ? (
                <input type="number" max={9} min={1} />
              ) : (
                <span>{col}</span>
              )}
            </td>
          ))}
        </tr>
      ))}
    </table>
  );
};

const Layout = (body, script) => `
  <html lang="en">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
    <head>
      <style>${style}</style>
    </head>
    <body>
        ${body}
        <script>${script}</script>
    </body>
  </html>
`;

export { App, Layout };
