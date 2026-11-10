import { css, cx } from '@emotion/css';
import { useMemo } from 'react';
import usePage from '~/hooks/usePage';

const styles = {
  wrapper: css({
    position: 'absolute',
    left: '2rem',
    bottom: '3rem',
    fontSize: '0.6rem',
    color: '#FFFFFF',
    '@media screen and (max-width: 860px)': {
      left: '1rem',
      bottom: '1rem',
      fontSize: '0.4rem',
    },
  }),
  paragraph: css({
    lineHeight: 1.5,
  }),
};

const Footer: React.FC = () => {
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
      <p className={styles.paragraph}>
        &copy; 2021, 서울대학교 아마추어 천문회.
        <br />
        Amateur Astronomy Association, Since 1980
        <br />
        Designed by Syeon, Programmed by Enif, sjhbread
      </p>
    </div>
  );
};

export default Footer;
