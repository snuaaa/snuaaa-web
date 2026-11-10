import { createContext } from 'react';
import { PageName } from '~/constants';

export type PageContextValue = {
  page: PageName;
  setPage: (page: PageName) => void;
};

export const PageContext = createContext<PageContextValue | null>(null);
