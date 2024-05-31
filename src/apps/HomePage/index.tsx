import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const apps = {
    'family-tree': 'Family Tree',
    'timeline-todo': 'Timeline Todo',
  };
  return (
    <div className="flex gap-2 p-4">
      {Object.entries(apps).map(([to, name]) => (
        <Link to={to} key={to}>
          <Button>{name}</Button>
        </Link>
      ))}
    </div>
  );
};

export default HomePage;
