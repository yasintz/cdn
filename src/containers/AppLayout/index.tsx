import React from 'react';

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return <div className="h-full w-full flex flex-col">{children}</div>;
};

export default AppLayout;
