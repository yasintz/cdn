import React, { useContext, useState } from 'react';
import style from './AddRelation.module.scss';
import { PersonType, RelationValueType } from '../../types';
import TypeSelector, { typeConfig } from '../TypeSelector';
import { useAppContext } from '../ctx';

type AddRelationProps = {
  person?: PersonType;
};

type PersonSelectorBoxProps = {
  person?: PersonType;
  setPerson: (p: PersonType) => void;
  base: PersonType;
};

const PersonSelectorBox: React.FC<PersonSelectorBoxProps> = ({
  person,
  setPerson,
  base,
}) => {
  const ctx = useAppContext();
  return (
    <div
      className={style.personSelector}
      onClick={() =>
        ctx.showPersonSelector({ cb: setPerson, person: person || base })
      }
    >
      {person?.name || ``}
    </div>
  );
};

type LineItem = {
  type: RelationValueType;
  main?: PersonType;
  extra?: PersonType;
  id: string;
};

type OnLinChange = (value: Partial<LineItem>) => void;

type LineProps = {
  onChange: OnLinChange;
  line: LineItem;
  onRemove: () => void;
  base: PersonType;
};

const Line: React.FC<LineProps> = ({
  onChange,
  onRemove,
  line: { type, main, extra },
  base,
}) => {
  const { adjunct } = typeConfig[type];
  const hasExtra = adjunct === 'of';

  function cb<T extends keyof LineItem>(name: T) {
    return (val: LineItem[T]) => onChange({ [name]: val });
  }

  return (
    <div>
      <span>{base.name}</span>
      <TypeSelector val={type} onChange={cb('type')} /> {adjunct}
      <PersonSelectorBox base={base} person={main} setPerson={cb('main')} />
      {hasExtra && (
        <>
          {' '}
          with
          <PersonSelectorBox
            base={base}
            person={extra}
            setPerson={cb('extra')}
          />
        </>
      )}
      <button onClick={onRemove}>X</button>
    </div>
  );
};

type PersonRendererProps = {
  person: PersonType;
  onGenerate: (lines: LineItem[]) => void;
};

const PersonRenderer: React.FC<PersonRendererProps> = ({
  person,
  onGenerate,
}) => {
  const ctx = useAppContext();
  const [lines, setLine] = useState<LineItem[]>([
    {
      type: 'parent',
      id: '1',
    },
  ]);
  return (
    <div className={style.personRenderer}>
      <span>{person.name}</span>
      <div className={style.lines}>
        {lines.map((line, index) => (
          <Line
            key={line.id}
            base={person}
            line={line}
            onRemove={() =>
              setLine((prev) => prev.filter((i) => i.id !== line.id))
            }
            onChange={(partial) =>
              setLine((prev) => {
                const newVal = { ...line, ...partial };
                const copy = Array.from(prev);
                copy[index] = newVal;
                return copy;
              })
            }
          />
        ))}
      </div>
      <div>
        <button onClick={() => ctx.showPersonSelector({ person })}>
          Detail
        </button>
        <button
          onClick={() => {
            onGenerate(lines);
            setLine([{ type: 'parent', id: '1' }]);
          }}
        >
          Generate
        </button>
        <button
          onClick={() =>
            setLine((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                type: 'parent',
              },
            ])
          }
        >
          Add
        </button>
      </div>
    </div>
  );
};

const AddRelation: React.FC<AddRelationProps> = ({ person }) => {
  const { createRelation } = useAppContext();

  const handleGenerate = (lines: LineItem[]) => {
    if (person) {
      const args = (
        lines.filter((i) => i.main) as {
          main: PersonType;
          type: RelationValueType;
          extra?: PersonType;
        }[]
      ).reduce((acc, cur) => {
        acc.push({
          type: cur.type,
          main: person?.id,
          second: cur.main.id,
        });
        if (cur.extra) {
          if (cur.type === 'children') {
            acc.push({
              type: cur.type,
              main: person.id,
              second: cur.extra.id,
            });
          } else {
            acc.push({
              type: cur.type,
              main: cur.extra.id,
              second: cur.main.id,
            });
          }
        }
        return acc;
      }, [] as { type: RelationValueType; main: string; second: string }[]);

      createRelation(...args);
    }
  };

  return (
    <div className={style.container}>
      {person && <PersonRenderer onGenerate={handleGenerate} person={person} />}
    </div>
  );
};

export default AddRelation;
