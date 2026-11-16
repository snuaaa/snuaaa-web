import Image from '~/components/image';
import { css, cx } from '@emotion/css';
import stars from '~/assets/img/stars.png';
import starsMobile from '~/assets/img/stars_mobile.png';
import usePage from '~/hooks/usePage';
import { pages } from '~/constants/index';

const styles = {
  background: css({
    position: 'absolute',
    height: `${pages.length * 100}%`,
    width: '100%',
    zIndex: -1,
    background:
      'linear-gradient(180deg, #142E50 0.39%, #193053 14.97%, #184E80 36.32%, #4B87A9 64.45%, #9CDBFF 85.28%, #FFFFFF 100%)',
    top: 0,
    transitionProperty: 'top',
    transitionDuration: '1s',
    transitionTimingFunction: 'ease',
  }),
  stars: css({
    position: 'fixed',
    height: '100%',
    width: '100vw',
    top: 0,
    mixBlendMode: 'lighten',
    opacity: 0.7,
    '@media screen and (max-width: 860px)': {
      display: 'none',
    },
  }),
  mobile: css({
    display: 'none',
    '@media screen and (max-width: 860px)': {
      display: 'block',
    },
  }),
};

const Background: React.FC = () => {
  const { index } = usePage();
  const backgroundStyle = css({
    top: `${index * -100}%`,
  });
  return (
    <div className={cx([styles.background, backgroundStyle])}>
      <span className={styles.stars}>
        <Image
          src={stars}
          layout="fill"
          objectFit="cover"
          alt="background"
          priority
        />
      </span>
      <span className={cx([styles.stars, styles.mobile])}>
        <Image
          src={starsMobile}
          layout="fill"
          objectFit="cover"
          alt="background_mobile"
          priority
        />
      </span>
    </div>
  );
};
export default Background;
