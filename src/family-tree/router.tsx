import { Outlet, RouteObject } from 'react-router-dom';
import Layout from './src/components/layout';
import PersonLayout from './src/components/person-layout';
import HomePage from './src/pages';
import CreatePersonPage from './src/pages/create-person';
import PersonHomePage from './src/pages/person/[personId]';
import PersonAddRelationPage from './src/pages/person/[personId]/add-relation';
import PersonDeletePage from './src/pages/person/[personId]/delete';
import PersonMetadataPage from './src/pages/person/[personId]/metadata';
import PersonParentTreePage from './src/pages/person/[personId]/parent-tree';
import PersonRawJsonPage from './src/pages/person/[personId]/raw';
import PersonTreePage from './src/pages/person/[personId]/tree';
import PersonUpdatePage from './src/pages/person/[personId]/update';
import SettingsPage from './src/pages/settings';
import './src/assets/styles/global.scss';

const FamilyTreeRouter: RouteObject = {
  path: '/',
  element: (
    <Layout>
      <Outlet />
    </Layout>
  ),
  children: [
    {
      index: true,
      element: <HomePage/>,
    },
    {
      path: 'create-person',
      element: <CreatePersonPage />,
    },
    {
      path: 'settings',
      element: <SettingsPage />,
    },
    {
      path: 'person/:personId',
      element: (
        <PersonLayout>
          <Outlet />
        </PersonLayout>
      ),
      children: [
        {
          index: true,
          element: <PersonHomePage />,
        },
        {
          path: 'tree',
          element: <PersonTreePage />,
        },
        {
          path: 'parent-tree',
          element: <PersonParentTreePage />,
        },
        {
          path: 'update',
          element: <PersonUpdatePage />,
        },
        {
          path: 'metadata',
          element: <PersonMetadataPage />,
        },
        {
          path: 'raw-json',
          element: <PersonRawJsonPage />,
        },
        {
          path: 'add-relation',
          element: <PersonAddRelationPage />,
        },
        {
          path: 'delete',
          element: <PersonDeletePage />,
        },

        {
          path: '*',
          element: <h1>Person Home</h1>,
        },
      ],
    },
  ],
};

export default FamilyTreeRouter;
