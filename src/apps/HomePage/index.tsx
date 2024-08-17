import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { apps } from './apps';

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

export { HomePage as Component };
