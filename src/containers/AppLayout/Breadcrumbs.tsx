import { Link, useMatches } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { routes } from '@/navigation/router';

const Breadcrumbs = () => {
  const [, matched] = useMatches();
  const pathname = matched?.pathname?.replace('/cdn/', '');
  const app = routes.find((i) => i.path === pathname);
  if (!app) {
    return null;
  }
  return (
    <Breadcrumb className="p-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link to="/cdn/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{app.title as string}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
