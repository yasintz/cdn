import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

import 'react-spring-bottom-sheet/dist/style.css';
import './app.scss';

export default () => <RouterProvider router={router} />;
