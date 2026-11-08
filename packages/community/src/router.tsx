import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import RouteErrorComponent from './components/Common/RouteErrorComponent';

/**
 * Page transitions (index.css, `page` view transition type) run only when
 * the path changes, so search-param changes such as `?photo=<id>` keep their
 * own animations, and the first load shows the page at once. Browsers
 * without view transition types get none rather than the default crossfade
 * on every navigation. Observation mode skips them too, since its filter
 * doesn't reach the transition snapshots.
 */
const supportsViewTransitionTypes =
  typeof window !== 'undefined' &&
  window.CSS?.supports?.('selector(:active-view-transition-type(a))');

export const router = createRouter({
  routeTree,
  defaultErrorComponent: RouteErrorComponent,
  defaultViewTransition: supportsViewTransitionTypes
    ? {
        types: ({ fromLocation, pathChanged }) =>
          fromLocation &&
          pathChanged &&
          document.documentElement.dataset.observation !== 'on'
            ? ['page']
            : false,
      }
    : false,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
