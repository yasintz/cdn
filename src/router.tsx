import React from 'react';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import { NotFoundPage } from './404';

const BookCoverGenerator = React.lazy(() => import('./book-cover-generator'));
const Gk27 = React.lazy(() => import('./gk27'));
const ZinciriKirma = React.lazy(() => import('./zinciri-kirma'));
const YardimLocation = React.lazy(() => import('./yardim-location'));
const FamilyTree = React.lazy(() => import('./family-tree'));
const MesaiTakip = React.lazy(() => import('./mesai-takip'));

const router = createHashRouter([
  {
    path: '/',
    element: <div>Hello world!</div>,
  },
  {
    path: 'book-cover-generator',
    element: (
      <React.Suspense>
        <BookCoverGenerator />
      </React.Suspense>
    ),
  },
  {
    path: 'gk27',
    element: (
      <React.Suspense>
        <Gk27 />
      </React.Suspense>
    ),
  },
  {
    path: 'zinciri-kirma',
    element: (
      <React.Suspense>
        <ZinciriKirma />
      </React.Suspense>
    ),
  },
  {
    path: 'yardim-location',
    element: (
      <React.Suspense>
        <YardimLocation />
      </React.Suspense>
    ),
  },
  {
    path: 'family-tree/*',
    element: (
      <React.Suspense>
        <FamilyTree />
      </React.Suspense>
    ),
  },
  {
    path: 'mesai-takip',
    element: (
      <React.Suspense>
        <MesaiTakip />
      </React.Suspense>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default () => <RouterProvider router={router} />;
