import { useRoutes } from 'react-router-dom';
import routes from './router';

export const Component = () => {
  return useRoutes(routes);
};

