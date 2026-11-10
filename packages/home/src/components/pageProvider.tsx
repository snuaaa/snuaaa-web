import { useMemo, useState } from 'react';
import { PageName, pages } from '~/constants';
import { PageContext } from '~/hooks/pageContext';

const PageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [page, setPage] = useState<PageName>(pages[0]);
  const value = useMemo(() => ({ page, setPage }), [page]);
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export default PageProvider;
