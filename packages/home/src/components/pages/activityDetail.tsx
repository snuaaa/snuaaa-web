import { css, cx } from '@emotion/css';
import { useEffect, useState } from 'react';
import Image from '~/components/image';
import Star from '../star';

const styles = {
  wrapper: css({
    position: 'absolute',
    zIndex: 1,
    cursor: 'pointer',
  }),
  button: css({
    cursor: 'pointer',
    position: 'relative',
    background: 'none',
  }),
  font: css({
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    top: '3rem',
    width: '4rem',
    margin: 'auto',
    fontFamily: 'Cafe24SsurroundAir',
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  }),
  detailWrapper: css({
    position: 'absolute',
    top: '-1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '10rem',
  }),
  detailImg: css({
    '& > div': {
      borderRadius: '1rem',
    },
  }),
  detailDescription: css({
    fontSize: '0.8rem',
  }),
};

type Props = {
  index: number;
  left: string;
  top: string;
  name: string;
  starWidth: number;
  starHeight: number;
  starTranform: string;
  detailImg: string;
  detailDescription: string;
};

const ActivityDetail: React.FC<Props> = (props) => {
  const {
    index,
    left,
    top,
    name,
    starHeight,
    starWidth,
    starTranform,
    detailImg,
    detailDescription,
  } = props;
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const customStyle = {
    wrapper: css({
      left,
      top,
    }),
    star: css({
      transform: starTranform,
    }),
    detailWrapper: css({
      visibility: showDetail ? 'visible' : 'hidden',
    }),
  };

  useEffect(() => {
    const onClickOut = () => {
      if (showDetail) {
        setShowDetail(false);
      }
    };
    document.addEventListener('click', onClickOut);
    return () => {
      document.removeEventListener('click', onClickOut);
    };
  }, [showDetail]);

  return (
    <div
      role="button"
      className={cx([styles.wrapper, customStyle.wrapper])}
      onClick={() => setShowDetail(!showDetail)}
      onKeyPress={() => setShowDetail(!showDetail)}
      tabIndex={index}
    >
      <button type="button">
        <Star
          width={starWidth}
          height={starHeight}
          className={customStyle.star}
        />
      </button>
      <p className={styles.font}>{name}</p>
      <div className={cx([customStyle.detailWrapper, styles.detailWrapper])}>
        <span className={styles.detailImg}>
          <Image src={detailImg} alt={`img_${name}`} objectFit="cover" />
        </span>
        <p className={styles.detailDescription}>{detailDescription}</p>
      </div>
    </div>
  );
};

export default ActivityDetail;
