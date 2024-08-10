import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { WebMidi, NoteMessageEvent } from 'webmidi';
import Paper, { NoteType, PositionType } from './Paper';

type KeyboardKeyInfo = {
  note: NoteType;
  position: PositionType;
  beat: number;
};

const parts = {
  up: 59,
  down: 57,
};

const noteMap: Record<NoteType, string> = {
  do: 'C',
  re: 'D',
  mi: 'E',
  fa: 'F',
  sol: 'G',
  la: 'A',
  si: 'B',
};

const letterMap: Record<string, NoteType> = Object.fromEntries(
  Object.entries(noteMap).map(([key, value]) => [value, key])
) as any;

const learnedNotes: Record<PositionType, NoteType[]> = {
  up: ['do', 're', 'mi'],
  down: ['sol', 'fa', 'mi'],
};

function getRandomNote(): KeyboardKeyInfo {
  const position = _.shuffle(['up', 'down'])[0] as PositionType;
  const note: NoteType = _.shuffle(learnedNotes[position])[0] as any;

  return { position, note, beat: 1 };
}

const PianoExercise = () => {
  const [isReady, setIsReady] = useState(false);
  const [randomNote, setRandomNote] = useState<KeyboardKeyInfo>(
    getRandomNote()
  );
  const [pressedNote, setPressedNote] = useState<KeyboardKeyInfo>();
  const [message, setMessage] = useState<string>('');

  const onPressListener = useCallback((e: NoteMessageEvent) => {
    const position = e.note.number >= parts.up ? 'up' : 'down';
    const note = letterMap[e.note.name];
    setPressedNote({
      note,
      position,
      beat: 1,
    });
  }, []);

  useEffect(() => {
    WebMidi.enable()
      .then(() => {
        setIsReady(true);
        const mySynth = WebMidi.inputs[0];
        mySynth.channels[1].addListener('noteoff', onPressListener);
      })
      .catch((err) => alert(err));
  }, [onPressListener]);

  useEffect(() => {
    if (pressedNote) {
      if (_.isEqual(randomNote, pressedNote)) {
        setMessage('');
        setRandomNote(getRandomNote());
        setPressedNote(undefined);
      } else {
        setMessage(`${pressedNote.note} != ${randomNote.note}`);
        setPressedNote(undefined);
      }
    }
  }, [pressedNote, randomNote]);

  if (!isReady) {
    return <h1 className="p-4 text-center w-full">Loading...</h1>;
  }

  const upNotes = randomNote.position === 'up' ? [randomNote] : [];
  const downNotes = randomNote.position === 'down' ? [randomNote] : [];

  return (
    <div className="flex flex-col">
      <div className="w-full text-center">{randomNote.note}</div>
      <div className="flex w-1/2 self-center mt-6" style={{ height: 200 }}>
        <Paper upNotes={upNotes} downNotes={downNotes} />
      </div>
      {message && (
        <h2
          className="p-4 text-center w-full text-xl"
          style={{ color: pressedNote === randomNote ? 'green' : 'red' }}
        >
          {message}
        </h2>
      )}
    </div>
  );
};

export default PianoExercise;
