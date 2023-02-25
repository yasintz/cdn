import React from 'react';
import { Outlet } from 'react-router-dom';

const FamilyTree = () => {
  return (
    <div>
      Wrapper...
      <Outlet />
    </div>
  );
};

export default FamilyTree;
