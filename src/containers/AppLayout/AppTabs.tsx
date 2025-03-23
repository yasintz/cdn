import { routes } from '@/navigation/router';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AppTabs = () => {
  return (
    <div
      className="flex gap-2 px-4 py-2 overflow-x-scroll text-sm max-w-full w-full"
      style={{
        minHeight: 40,
      }}
    >
      {routes.map((i) => (
        <NavLink
          key={i.path}
          to={i.cardPath || i.path!.replace('/*', '')}
          className={({ isActive }) =>
            cn(
              'px-2 rounded-md whitespace-nowrap flex items-center',
              isActive ? 'bg-gray-100 text-black' : 'text-gray-600'
            )
          }
        >
          {i.title}
        </NavLink>
      ))}
    </div>
  );
};

export default AppTabs;
