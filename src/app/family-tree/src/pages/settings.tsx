import React from 'react';
import { useAppContext } from '../app/ctx';

const SettingsPage = () => {
  const { treeDepth, setTreeDepth } = useAppContext();
  return (
    <div>
      <label>
        Depth:
        <input
          type="number"
          value={treeDepth.toString()}
          onChange={(e) => setTreeDepth(parseInt(e.target.value))}
          style={{ maxWidth: '60%' }}
        />
      </label>
    </div>
  );
};

export default SettingsPage;
