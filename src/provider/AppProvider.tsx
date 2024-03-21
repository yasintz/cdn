import { RouterProvider, RouterProviderProps } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

const queryClient = new QueryClient();
type AppProviderProps = {
  router: RouterProviderProps['router'];
  defaultTheme?: 'dark' | 'light';
};

const AppProvider = ({ router, defaultTheme = 'light' }: AppProviderProps) => {
  return (
    <ThemeProvider defaultTheme={defaultTheme} storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
