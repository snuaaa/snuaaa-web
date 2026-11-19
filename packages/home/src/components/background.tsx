import { useEffect, useRef, useState } from 'react';
import Image from '~/components/image';
import { css, cx } from '@emotion/css';
import stars from '~/assets/img/stars.png';
import starsMobile from '~/assets/img/stars_mobile.png';
import usePage from '~/hooks/usePage';
import { pages } from '~/constants/index';
import type Starfield from '~/animation/starfield';

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
  canvas: css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100%',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 1.2s ease',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  }),
  visible: css({
    opacity: 1,
  }),
};

const Background: React.FC = () => {
  const { index } = usePage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starfieldRef = useRef<Starfield | null>(null);
  const indexRef = useRef(index);
  indexRef.current = index;
  // 'loading' until the 3D starfield is ready; the gradient alone shows meanwhile, and the stars brighten in.
  // 'failed' (no WebGL, the catalog didn't load, or the WebGL context was lost) falls back to the static star images.
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>(
    'loading',
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cancelled = false;

    // three.js loads in its own chunk, after the prerendered page is on screen.
    import('~/animation/starfield')
      .then(async ({ default: StarfieldClass, loadStarCatalog }) => {
        const catalog = await loadStarCatalog();
        if (cancelled) return;
        starfieldRef.current = new StarfieldClass(
          canvas,
          catalog,
          indexRef.current,
          () => setStatus('failed'),
        );
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });

    return () => {
      cancelled = true;
      starfieldRef.current?.destroy();
      starfieldRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status === 'failed') {
      starfieldRef.current?.destroy();
      starfieldRef.current = null;
    }
  }, [status]);

  useEffect(() => {
    starfieldRef.current?.setPage(index);
  }, [index]);

  const backgroundStyle = css({
    top: `${index * -100}%`,
  });
  return (
    <div className={cx([styles.background, backgroundStyle])}>
      {status === 'failed' ? (
        <>
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
        </>
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cx([styles.canvas, status === 'ready' && styles.visible])}
        />
      )}
    </div>
  );
};
export default Background;
