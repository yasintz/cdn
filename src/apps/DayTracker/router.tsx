import { RouteObject, Outlet } from 'react-router-dom';
import { MonthTracker } from './components/MonthTracker';
import { Summary } from './components/Summary';
import { FrequencyView } from './components/FrequencyView';

export const routes: RouteObject[] = [
  {
    path: '',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <MonthTracker />,
      },
      {
        path: 'summary',
        element: <Summary />,
      },
      {
        path: 'frequency',
        element: <FrequencyView />,
      },
    ],
  },
];

export default routes;

