import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const BookCoverGenerator = React.lazy(
  () => import('./book-cover-generator/index')
);

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
      path: '*',
      element: <h1>404...</h1>,
    },
  ],
  { basename: '/cdn/' }
);

export default () => <RouterProvider router={router} />;
