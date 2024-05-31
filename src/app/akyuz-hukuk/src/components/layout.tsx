import React from 'react';
type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return <>{children}</>;
};

export default Layout;
