import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { routes } from '@/navigation/router';

const HomePage = () => {
  return (
    <div className="flex gap-2 p-4 flex-wrap">
      {routes
        .filter((i) => !i.hiddenApp)
        .map((name) => (
          <Link
            to={name.cardPath || name.path!.replace('/*', '')}
            key={name.path}
          >
            <Card className="overflow-hidden">
              <img
                src={name.image as string}
                className="w-64 aspect-video object-cover border-b"
              />
              <CardHeader>
                <CardTitle className="text-lg text-center">
                  {name.title as string}
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
