import { Outlet } from 'react-router-dom';
import Layout from './components/layout';
import PersonLayout from './components/person-layout';
import HomePage from './pages';
import CreatePersonPage from './pages/create-person';
import PersonHomePage from './pages/person/[personId]';
import PersonAddRelationPage from './pages/person/[personId]/add-relation';
import PersonDeletePage from './pages/person/[personId]/delete';
import PersonMetadataPage from './pages/person/[personId]/metadata';
import PersonParentTreePage from './pages/person/[personId]/parent-tree';
import PersonRawJsonPage from './pages/person/[personId]/raw';
import PersonTreePage from './pages/person/[personId]/tree';
import PersonUpdatePage from './pages/person/[personId]/update';
import SettingsPage from './pages/settings';

export const router = {
  path: 'family-tree',
  element: (
    <Layout>
      <Outlet />
    </Layout>
  ),
  children: [
    {
      index: true,
      element: <HomePage />,
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
