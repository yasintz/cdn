import React, { useContext } from 'react';
import { PersonType } from '../types';
import useData from './data';

export enum TreeView {
  Default = 'default',
  DTree = 'dtree',
  List = 'list',
}

type ContextType = ReturnType<typeof useData> & {
  showCreatePersonModal: () => void;
  showPersonSelector: (v: {
    cb?: (person: PersonType) => void;
    person?: PersonType;
  }) => void;
  treeDepth: number;
  setTreeDepth: React.Dispatch<React.SetStateAction<number>>;
  isDTree: boolean;
  treeView: TreeView;
  setTreeView: (view: TreeView) => void;
};

export const AppContext = React.createContext<ContextType>(
  {} as unknown as ContextType
);

export const useAppContext = () => useContext(AppContext);
