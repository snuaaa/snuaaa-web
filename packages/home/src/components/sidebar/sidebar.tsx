import { useMemo } from 'react';
import { css, cx } from '@emotion/css';
import usePage from '~/hooks/usePage';
import ScrollStatusBar from './scrollStatusBar';
import Back from './back';

const styles = {
  wrapper: css({
    height: '100%',
    width: '20rem',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#FFFFFF',
    zIndex: 1,
    transitionProperty: 'opacity',
    transitionDuration: '1s',
    transitionTimingFunction: 'ease',
    '@media screen and (max-width: 860px)': {
      height: '4rem',
      width: '100%',
      flexDirection: 'row',
    },
  }),
};

const SideBar: React.FC = () => {
  const { index } = usePage();

  const visible = useMemo(
    () =>
      css({
        opacity: index === 0 ? 0 : 1,
      }),
    [index],
  );

  return (
    <div className={cx([styles.wrapper, visible])}>
      <Back />
      <ScrollStatusBar />
    </div>
  );
};

export default SideBar;
