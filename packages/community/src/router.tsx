import { createRouter, ParsedLocation } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    modal?: boolean;
    exhibitPhotoModal?: boolean;
    backgroundLocation?: ParsedLocation;
  }
}
