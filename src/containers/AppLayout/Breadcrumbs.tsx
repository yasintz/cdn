import { Link, useMatches } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { apps } from '@/apps/HomePage/apps';

const Breadcrumbs = () => {
  const [, matched] = useMatches();
  const pathname = matched?.pathname?.replace('/cdn/', '');
  const app = apps[pathname as keyof typeof apps];
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
          <BreadcrumbPage>{app.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
