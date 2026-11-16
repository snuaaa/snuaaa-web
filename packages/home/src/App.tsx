import { useMemo } from 'react';
import { css } from '@emotion/css';
import PageList from '~/components/pageList';
import Background from '~/components/background';
import usePage from '~/hooks/usePage';
import PageProvider from '~/components/pageProvider';
import useThrottleScroll from '~/hooks/useThrottleScroll';
import useResponsiveHeight from '~/hooks/useResponsiveHeight';
import SideBar from '~/components/sidebar/sidebar';
import Footer from '~/components/sidebar/footer';

const Main: React.FC = () => {
  const { index, next, prev } = usePage();
  // 0 until mounted, so the prerendered HTML (and the first client render) fill the viewport with CSS.
  const { responsiveHeight } = useResponsiveHeight();

  useThrottleScroll(prev, () => {
    if (index > 0) {
      next();
    }
  });

  const wrapperStyle = useMemo(
    () =>
      css({
        position: 'relative',
        height: responsiveHeight || '100%',
      }),
    [responsiveHeight],
  );

  return (
    <main className={wrapperStyle}>
      <Background />
      <SideBar />
      <PageList />
      <Footer />
    </main>
  );
};

const App: React.FC = () => (
  <PageProvider>
    <Main />
  </PageProvider>
);

export default App;
