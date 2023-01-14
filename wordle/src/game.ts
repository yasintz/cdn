import { wordleEvent } from './helpers/event';
import words from './words';

const gameAction = {
  removeLetter: () => wordleEvent.emit('remove-letter'),
  submitGuess: () => wordleEvent.emit('submit-guess'),
  addLetter: (s: string) => wordleEvent.emit('add-letter', s),
};

const API_URL = ' https://api.npoint.io/4aab6a5e7a2ec2d31ab5';

let cache = [];

wordleEvent.on('invalid-guess', ({ line }: { line: string }) => {
  setTimeout(() => {
    line.split('').forEach(() => {
      gameAction.removeLetter();
    });
  }, 1000);
});

async function update() {
  const newData: string[] = await fetch(API_URL).then((res) => res.json());

  if (cache.length === newData.length) {
    return;
  }

  if (newData.length === 0) {
    window.location.reload();
    return;
  }

  if (newData.length > cache.length) {
    cache = newData;
    const guess = Array.from(newData).pop()?.split('');

    if (!guess) {
      return;
    }

    for (let index = 0; index < guess.length; index++) {
      setTimeout(() => {
        gameAction.addLetter(guess[index]);
        if (index + 1 === guess.length) {
          setTimeout(() => {
            gameAction.submitGuess();
          }, 500);
        }
      }, index * 400);
    }
  }
}

setInterval(update, 2000);

localStorage.removeItem('gameState');

// @ts-ignore
window.$wordle = {};
// @ts-ignore
Object.assign(window.$wordle, {
  words: words,
  event: wordleEvent,
  gameActions: {},
});

setTimeout(() => {
  const scale = window.innerWidth / (800 * 2);

  document.body.style.transform = `scale(${scale})`;

  console.log('working...');
}, 0);
