import { Outlet } from 'react-router-dom';
import { BottomTab } from 'src/app/mesai-takip/components/BottomTab';

export const Layout = () => {
  return (
    <div className="page-container">
      <Outlet />
      <BottomTab />
    </div>
  );
};
