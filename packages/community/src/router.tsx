import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import RouteErrorComponent from './components/Common/RouteErrorComponent';

export const router = createRouter({
  routeTree,
  defaultErrorComponent: RouteErrorComponent,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
