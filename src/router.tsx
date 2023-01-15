import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const BookCoverGenerator = React.lazy(() => import('./book-cover-generator'));
const Gk27 = React.lazy(() => import('./gk27'));
const ZinciriKirma = React.lazy(() => import('./zinciri-kirma'));

const router = createBrowserRouter(
  [
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
      path: '*',
      element: <h1>404...</h1>,
    },
  ],
  { basename: '/cdn/' }
);

export default () => <RouterProvider router={router} />;
