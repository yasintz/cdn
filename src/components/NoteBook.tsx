import React, { useEffect, useMemo, useRef } from 'react';

type NoteBookProps = {
  id: string;
  initialDoc?: string;
  onChange?: (docStr: string) => void;
};

const noteIdKey = '_note_id';
// const host = 'http://localhost:3000';
const host = 'https://yasintz.github.io/lexical-editor';

const NoteBook = ({ id, initialDoc, onChange }: NoteBookProps) => {
  const url = useMemo(() => {
    const uri = new URL(host);
    const docHas = `#doc=${initialDoc}`;

    uri.searchParams.set(noteIdKey, id);
    uri.searchParams.set('autoSave', 'true');
    if (initialDoc) {
      uri.hash = docHas;
    }

    return uri;
  }, [id, initialDoc]);

  const watchParams = { onChange, initialDoc, id };
  const onChangeRef = useRef(watchParams);
  onChangeRef.current = watchParams;

  useEffect(() => {
    let prevDoc = onChangeRef.current.initialDoc;
    const interval = setInterval(() => {
      navigator.clipboard
        .readText()
        .then((clipText) => {
          if (!clipText.includes(host)) {
            return;
          }

          const { onChange, id } = onChangeRef.current;

          const url = new URL(clipText);
          const docStr = url.hash.split('#doc=')[1];

          if (docStr !== prevDoc && url.searchParams.get(noteIdKey) === id) {
            prevDoc = docStr;
            console.log('changed');
            onChange?.(docStr);
          }
        })
        .catch(() => {
          //
        });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full h-full border-none">
      <iframe
        allow="clipboard-read; clipboard-write"
        src={url.toString()}
        className="w-full h-full border-none"
      />
    </div>
  );
};

export default NoteBook;
