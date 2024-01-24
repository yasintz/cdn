import React, { useState } from 'react';
import style from './app.module.scss';
import { Gender } from '../types';

type CreatePersonProps = {
  onSubmit: (name: string, gender: Gender) => void;
  name?: string;
  gender?: Gender;
};

const CreatePerson: React.FC<CreatePersonProps> = ({
  onSubmit,
  name: initialName = '',
  gender: initialGender = 0,
}) => {
  const [name, setName] = useState(initialName);
  const [gender, setGender] = useState<Gender>(initialGender);
  return (
    <div className={style.createPersonContent}>
      <label>
        Name:
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <br />
      <br />
      <div
        onChange={(e) => setGender((e.target as any).value === 'Male' ? 0 : 1)}
      >
        <label>
          <input
            value="Male"
            type="radio"
            name="gender"
            defaultChecked={gender === 0}
          />
          Male
        </label>
        <label>
          <input
            value="Female"
            type="radio"
            name="gender"
            defaultChecked={gender === 1}
          />
          Female
        </label>
      </div>
      <br />
      <button disabled={!name} onClick={() => onSubmit(name, gender)}>
        {initialName ? 'Update' : 'Create'}
      </button>
    </div>
  );
};

export default CreatePerson;
