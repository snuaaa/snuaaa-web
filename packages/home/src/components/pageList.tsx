import { useEffect, useMemo } from 'react';
import { css } from '@emotion/css';
import usePage from '~/hooks/usePage';
import Home from './pages/home';
import Activity from './pages/activity';
import Dome from './pages/dome';
import Intro from './pages/intro';
import Telescope from './pages/telescope';
import History from './pages/history';
import Contact from './pages/contact';

const PageList: React.FC = () => {
  const { index, prev, next } = usePage();

  const styles = useMemo(
    () => ({
      wrapper: css({
        width: '100%',
        height: '100%',
        position: 'absolute',
        transform: `translateY(${-index * 100}%)`,
        transition: 'transform 0.5s ease',
        willChange: 'transform',
      }),
    }),
    [index],
  );

  useEffect(() => {
    const keyHandler = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowDown') {
        if (index > 0) {
          next();
        }
      } else if (ev.key === 'ArrowUp') {
        prev();
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('keydown', keyHandler);
    };
  }, [index, prev, next]);

  return (
    <>
      <div className={styles.wrapper}>
        <Home />
        <Intro />
        <Activity />
        <Dome />
        <Telescope />
        <History />
        <Contact />
      </div>
    </>
  );
};

export default PageList;
