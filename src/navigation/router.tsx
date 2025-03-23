import { RouteObject, createBrowserRouter } from 'react-router-dom';

type DefinedRoute = {
  path: string;
  lazy: () => Promise<{ Component: React.ComponentType<any> }>;
};

declare const $DEFINED_ROUTES: DefinedRoute[];

const definedRoutes = $DEFINED_ROUTES;

const definedRouteObjects: RouteObject[] = definedRoutes;

type HomePageAppType =
  | {
      title: string;
      image: string;
      cardPath?: string;
    }
  | {
      cardPath?: string;
      title?: string;
      image?: string;
    };

export const routes: Array<RouteObject & HomePageAppType> = [
  ...(definedRouteObjects as any),
  {
    index: true,
    lazy: () => import('../apps/HomePage'),
  },
  {
    path: 'database-editor',
    lazy: () => import('../apps/DatabaseEditor'),
    title: 'Database Editor',
    image:
      'https://cdn.dribbble.com/users/1962791/screenshots/5534733/database-4.jpg',
  },
  {
    path: 'family-tree/*',
    lazy: () => import('../app/family-tree/router'),
    title: 'Family Tree',
    image:
      'https://cdn.dribbble.com/users/82373/screenshots/6785208/familytree.jpg?resize=400x0',
  },
  {
    path: 'simple-todo-tracker/*',
    lazy: () => import('../apps/TimelineTodo/SimpleTodoTrackerView'),
    title: 'Timeline Todo',
    cardPath: 'simple-todo-tracker',
    image:
      'https://thumbs.dreamstime.com/b/satisfaction-crossing-off-everything-todo-list-vector-illustration-317472455.jpg?w=992',
  },
  {
    path: 'time-tracker',
    lazy: () => import('../apps/TimeTracker'),
    title: 'Time Tracker',
    image:
      'https://cdn.dribbble.com/users/5840087/screenshots/14061542/media/d3e37dc3707cede8f9d1fe9d3f6ad001.jpg?resize=400x0',
  },
  {
    path: 'video-player',
    lazy: () => import('../apps/VideoPlayer'),
    title: 'Video Player',
    image:
      'https://static.vecteezy.com/system/resources/previews/001/812/859/non_2x/video-player-play-button-simple-outline-color-icon-isolated-on-white-cartoon-hand-draw-illustration-vector.jpg',
  },
  {
    path: 'piano-exercise',
    lazy: () => import('../apps/PianoExercise'),
    title: 'Piano Exercise',
    image:
      'https://cdn.pixabay.com/photo/2021/03/10/14/57/pianist-6084749_1280.png',
  },
  {
    path: 'calendar',
    lazy: () => import('../apps/Calendar'),
    title: 'Calendar',
    image:
      'https://www.elegantthemes.com/blog/wp-content/uploads/2019/04/divi-transform-timeline-featured-image-3.jpg',
  },
  {
    path: 'code-snippets',
    lazy: () => import('../apps/CodeSnippets'),
    title: 'Code Snippets',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxSv7E4cJz1rLPR9yXv3K-IDlUmrl8clfgboMTYS_L4lToKVd-TPpCBZ05VIBYLnhKTbo&usqp=CAU',
  },
];

const router = createBrowserRouter([
  {
    path: '/cdn',
    children: routes,
  },
]);

export default router;
