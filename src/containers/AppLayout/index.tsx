import React from 'react';
import AppTabs from './AppTabs';

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="h-full w-full flex flex-col">
      <AppTabs />
      {children}
    </div>
  );
};

export default AppLayout;
