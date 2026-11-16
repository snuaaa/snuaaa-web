import { css, cx } from '@emotion/css';
import Image from '~/components/image';
import { nl2br } from '~/utils/formatter';
import prevIcon from '~/assets/img/icon/prev.svg';
import nextIcon from '~/assets/img/icon/next.svg';
import closeIcon from '~/assets/img/icon/close.svg';

const styles = {
  wrapper: css({
    position: 'relative',
    width: '25rem',
    background: '#9CDBFF',
    padding: '2rem',
    borderRadius: '1.5rem',
    '@media screen and (max-width: 800px)': {
      padding: '1rem',
    },
  }),
  top: css({
    display: 'flex',
    justifyContent: 'center',
  }),
  bottom: css({
    display: 'flex',
    justifyContent: 'center',
  }),
  name: css({
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: '1.3rem',
    margin: '1.3rem',
    '@media screen and (max-height: 800px)': {
      margin: '1rem',
    },
  }),
  description: css({
    lineHeight: 1.4,
    color: '#143663',
    fontSize: '1rem',
    '@media screen and (max-width: 800px)': {
      fontSize: '0.7rem',
    },
  }),
  image: css({
    display: 'flex',
    maxHeight: '20rem',
    maxWidth: '100%',
    justifyContent: 'center',
    '& > div': {
      borderRadius: '1rem',
    },
    '@media screen and (max-height: 800px)': {
      maxHeight: '13rem',
    },
    '@media screen and (max-height: 600px)': {
      maxHeight: '10rem',
    },
  }),
  buttton: css({
    background: 'none',
    border: 'none',
  }),
  disabled: css({
    visibility: 'hidden',
  }),
};

type Props = {
  name: string;
  image: string;
  description: string;
  movePrev: () => void;
  moveNext: () => void;
  close: () => void;
  canMovePrev: boolean;
  canMoveNext: boolean;
};

const TelescopeDetail: React.FC<Props> = (props) => {
  const {
    name,
    image,
    description,
    movePrev,
    moveNext,
    close,
    canMovePrev,
    canMoveNext,
  } = props;

  return (
    <>
      <div
        className={styles.wrapper}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={() => {}}
      >
        <div className={styles.top}>
          <button
            type="button"
            onClick={movePrev}
            className={cx([styles.buttton, canMovePrev || styles.disabled])}
          >
            <Image src={prevIcon} alt="prevIcon" objectFit="contain" />
          </button>
          <h4 className={styles.name}>{name}</h4>
          <button
            type="button"
            onClick={moveNext}
            className={cx([styles.buttton, canMoveNext || styles.disabled])}
          >
            <Image src={nextIcon} alt="nextIcon" objectFit="contain" />
          </button>
        </div>
        <span className={styles.image}>
          <Image src={image} alt={`img_${name}`} objectFit="contain" />
        </span>
        <p className={styles.description}>{nl2br(description)}</p>
        <div className={styles.bottom}>
          <button type="button" onClick={close} className={styles.buttton}>
            <Image src={closeIcon} alt="closeIcon" objectFit="contain" />
          </button>
        </div>
      </div>
    </>
  );
};

export default TelescopeDetail;
