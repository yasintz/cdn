import React from 'react';
import { TreeView, useAppContext } from '../app/ctx';

const SettingsPage = () => {
  const { setTreeView, treeView, treeDepth, setTreeDepth } = useAppContext();
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
      <br />
      <br />
      <label>
        Tree View{' '}
        <select
          onChange={(e) => setTreeView(e.target.value as TreeView)}
          value={treeView}
        >
          <option value={TreeView.DTree}>Dtree</option>
          <option value={TreeView.Default}>Default</option>
          <option value={TreeView.List}>List</option>
        </select>
      </label>
    </div>
  );
};

export default SettingsPage;
