import { css, cx } from '@emotion/css';

type Props = {
  className?: string;
  width: number;
  height: number;
};

const Star: React.FC<Props> = ({ className, width, height }) => {
  const styles = {
    span: css({
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
    }),
    star: css({
      fill: '#FFFFFF',
      transition: 'fill ease 0.3s',
      width,
      height,
      '&:hover': {
        fill: '#FFD45F',
      },
      '@media screen and (max-width: 1200px)': {
        width: width / 2,
        height: height / 2,
      },
      '@media screen and (max-width: 800px)': {
        width: width / 2.5,
        height: height / 2.5,
      },
    }),
  };

  return (
    <span className={cx([styles.span])}>
      <svg
        viewBox="0 0 87 78"
        className={cx([className, styles.star])}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M34 21L40 0L56.5 24.5L87 21L68 43.5L80 77.5L48 52L22 74.5L28 40L0 21H34Z" />
      </svg>
    </span>
  );
};

export default Star;
