import { RouterProvider, RouterProviderProps } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();
type AppProviderProps = {
  router: RouterProviderProps['router'];
};

const AppProvider = ({ router }: AppProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
};

export default AppProvider;
