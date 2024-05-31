import React from 'react';

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return <>{children}</>;
};

export default AppLayout;
