import { router } from './routes';
import AppProvider from '@/provider/AppProvider';
import './app.scss';

export default () => <AppProvider router={router} />;
