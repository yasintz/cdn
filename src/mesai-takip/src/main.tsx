import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';

import 'react-spring-bottom-sheet/dist/style.css';
import './app.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
