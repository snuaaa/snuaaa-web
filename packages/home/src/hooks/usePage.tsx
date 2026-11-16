import { useCallback, useContext } from 'react';
import { PageName, pages } from '~/constants';
import { PageContext } from './pageContext';

const getPageIndex = (page: PageName) =>
  pages.findIndex((_page) => page === _page);

const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used inside PageProvider');
  }
  const { page, setPage } = context;
  const index = getPageIndex(page);

  const prev = useCallback(() => {
    if (index > 0) {
      setPage(pages[index - 1]);
    }
  }, [index, setPage]);

  const next = useCallback(() => {
    if (index < pages.length - 1) {
      setPage(pages[index + 1]);
    }
  }, [index, setPage]);

  const reset = useCallback(() => {
    setPage(pages[0]);
  }, [setPage]);

  const max = pages.length;

  return { reset, prev, next, index, max, page };
};

export default usePage;
