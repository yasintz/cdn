import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export const apps = {
  'family-tree': {
    title: 'Family Tree',
    image:
      'https://cdn.dribbble.com/users/82373/screenshots/6785208/familytree.jpg?resize=400x0',
  },
  'timeline-todo': {
    title: 'Timeline Todo',
    image:
      'https://www.elegantthemes.com/blog/wp-content/uploads/2019/04/divi-transform-timeline-featured-image-3.jpg',
  },
  'time-tracker': {
    title: 'Time Tracker',
    image:
      'https://cdn.dribbble.com/users/5840087/screenshots/14061542/media/d3e37dc3707cede8f9d1fe9d3f6ad001.jpg?resize=400x0',
  },
};
const HomePage = () => {
  return (
    <div className="flex gap-2 p-4 flex-wrap">
      {Object.entries(apps).map(([to, name]) => (
        <Link to={to} key={to}>
          <Card className="overflow-hidden">
            <img
              src={name.image}
              className="w-64 aspect-video object-cover border-b"
            />
            <CardHeader>
              <CardTitle className="text-lg text-center">
                {name.title}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default HomePage;
