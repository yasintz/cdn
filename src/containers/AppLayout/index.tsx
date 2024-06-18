import React from 'react';
import Breadcrumbs from './Breadcrumbs';

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="h-full w-full flex flex-col">
      <Breadcrumbs />
      {children}
    </div>
  );
};

export default AppLayout;
