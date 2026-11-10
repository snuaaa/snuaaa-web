import { css, cx, keyframes } from '@emotion/css';
import Image from '~/components/image';
import usePage from '~/hooks/usePage';
import star from '~/assets/img/star.svg';

const animation = {
  fadeIn: keyframes({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  }),
};

const styles = {
  wrapper: css({
    width: '7rem',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '@media screen and (max-width: 860px)': {
      right: 0,
      width: '50%',
      flexDirection: 'row',
      justifyContent: 'end',
      alignItems: 'center',
      paddingRight: '1rem',
    },
  }),
  dot: css({
    height: '0.5rem',
    width: '0.5rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    margin: '1rem',
    transition: 'all ease 1s',
    '@media screen and (max-width: 860px)': {
      height: '0.4rem',
      width: '0.4rem',
      margin: '0.5rem',
    },
  }),
  star: css({
    width: '1rem',
    height: '1rem',
    margin: '0.75rem',
    background: 'transparent',
    animation: `${animation.fadeIn} 1s`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '@media screen and (max-width: 860px)': {
      height: '0.6rem',
      width: '0.6rem',
      margin: '0.3rem',
    },
  }),
};

const ScrollStatusBar: React.FC = () => {
  const { index, max } = usePage();

  const makeStatus = () =>
    Array(max - 1)
      .fill('')
      .map((val, _index) => {
        if (index - 1 === _index) {
          return (
            <span
              key={String(_index)}
              className={cx([styles.dot, styles.star])}
            >
              <Image src={star} alt="star" width={16} height={16} />
            </span>
          );
        }
        return <div key={String(_index)} className={styles.dot} />;
      });

  return <div className={styles.wrapper}>{makeStatus()}</div>;
};
export default ScrollStatusBar;
