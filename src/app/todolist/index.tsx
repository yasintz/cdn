import { router } from './routes';
import AppProvider from '@/provider/AppProvider';
import './app.scss';

export default () => <AppProvider defaultTheme="dark" router={router} />;
