import * as React from 'react';
import * as fs from 'fs';
import * as Server from 'react-dom/server';
import { App, Layout } from './app';
import { boards, sudoku } from './utils';
import data from './data';

const all = {
  0: boards.easy,
  1: boards.medium,
  2: boards.hard,
  3: boards.veryHard,
  // 4: boards.insane,
  // 5: boards.inhuman,
  // e: boards.easy,
  // m: boards.medium,
  // h: boards.hard,
  // vh: boards.veryHard,
  // i: boards.insane,
  // ih: boards.inhuman,
  // ...boards,
};

// app.get('/:mode/:index', (req, res) => {
//   const { mode, index } = req.params;
//   const game = data[all[mode]];
//   const board = game[index];
//   res.send(
//     Layout(
//       Server.renderToString(<App board={sudoku.board_string_to_grid(board)} />),
//       fs.readFileSync('./src/script.js', 'utf-8')
//     )
//   );
// });

const script = fs.readFileSync('./sudoku/script.js', 'utf-8');
Object.keys(all).forEach((level) => {
  const game = data[all[level] as keyof typeof data];

  game.slice(0, 100).forEach((boardStr, index) => {
    const html = Layout(
      Server.renderToString(
        <App board={sudoku.board_string_to_grid(boardStr)} />
      ),
      script
    );

    fs.writeFileSync(`../dist/sudoku/${level}-${index}.html`, html);
  });
});
