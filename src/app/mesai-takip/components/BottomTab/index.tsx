import { Home, Settings, Plus } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { routePaths } from 'src/app/mesai-takip/utils/routes';

export const BottomTab = () => {
  const navigate = useNavigate();

  const openCreate = () => navigate(routePaths.create());
  const openHome = () => navigate(routePaths.home());
  const openSettings = () => navigate(routePaths.settings());

  return (
    <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border-t border-gray-200 bottom-0 left-1/2 dark:bg-gray-900 dark:border-gray-600">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto">
        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          onClick={openHome}
        >
          <Home
            className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
            size={20}
          />
        </button>

        <div className="flex items-center justify-center">
          <button
            type="button"
            className="inline-flex items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
            onClick={openCreate}
          >
            <Plus className="text-white" size={20} />
          </button>
        </div>

        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          onClick={openSettings}
        >
          <Settings
            className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
            size={20}
          />
        </button>
      </div>
    </div>
  );
};
