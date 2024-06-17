import React from 'react';
import Breadcrumbs from './Breadcrumbs';

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs />
      {children}
    </div>
  );
};

export default AppLayout;
