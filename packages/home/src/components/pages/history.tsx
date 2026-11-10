import { css, cx } from '@emotion/css';
import { Fragment } from 'react';
import Page from '~/components/page';
import historyData from './historyData';

const scrollbarSize = '1rem';
const gradientSize = '5rem';
const gradientSizeMobile = '2rem';

const styles = {
  main: css({
    color: '#FFFFFF',
    height: '100%',
    width: 'calc(100% - 30rem)',
    padding: '3rem 0 7rem 0',
    display: 'flex',
    flexDirection: 'column',
    '@media screen and (max-width: 800px)': {
      width: 'calc(100% - 4rem)',
    },
  }),
  title: css({
    fontFamily: '"Snowburst One", cursive',
    fontSize: '2.5rem',
    fontWeight: 'normal',
    marginBottom: '5rem',
    textAlign: 'center',
    '@media screen and (max-width: 800px)': {
      fontSize: '2rem',
    },
    '@media screen and (max-height: 900px)': {
      fontSize: '2rem',
      marginBottom: '1.5rem',
    },
    '@media screen and (max-height: 600px)': {
      fontSize: '1.7rem',
      marginBottom: '1rem',
    },
  }),
  historyGridContainer: css({
    position: 'relative',
    display: 'grid',
    gridTemplateRows: '1fr 1fr 1fr',
    gridAutoFlow: 'column',
    fontFamily: 'Cafe24Ssurround',
    flexGrow: 1,
    overflow: 'auto',
    gap: '1rem',
    maskImage: `linear-gradient(to right, transparent, #000000 ${gradientSize}, #000000 calc(100% - ${gradientSize}), transparent 100% ), linear-gradient(#000000, #000000)`,
    maskRepeat: 'no-repeat, no-repeat',
    maskSize: `auto calc(100% - ${scrollbarSize}), auto ${scrollbarSize}`,
    maskPosition: 'top, bottom',
    paddingBottom: scrollbarSize,
    paddingLeft: gradientSize,
    paddingRight: gradientSize,
    '@media screen and (max-width: 800px)': {
      maskImage: `linear-gradient(to right, transparent, #000000 ${gradientSizeMobile}, #000000 calc(100% - ${gradientSizeMobile}), transparent 100% ), linear-gradient(#000000, #000000)`,
      paddingLeft: gradientSizeMobile,
      paddingRight: gradientSizeMobile,
    },
    '@media screen and (max-height: 750px)': {
      gridTemplateRows: '1fr 1fr',
    },
  }),
  historyGridItem: css({
    width: '15rem',
    '&:first-child h4': {
      color: '#FFD45F',
      position: 'relative',
      '&::after': {
        position: 'absolute',
        left: '6rem',
        top: 0,
        display: 'block',
        content: '""',
        height: '2.5rem',
        width: '2.5rem',
        background: 'url(/img/star_history.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        '@media screen and (max-height: 900px)': {
          height: '1.7rem',
          width: '1.7rem',
        },
        '@media screen and (max-height: 600px)': {
          height: '1.5rem',
          width: '1.5rem',
        },
      },
    },
  }),
  year: css({
    fontSize: '2rem',
    margin: '0.5rem 0',
    '@media screen and (max-height: 900px)': {
      fontSize: '1.3rem',
    },
    '@media screen and (max-height: 600px)': {
      fontSize: '1.1rem',
    },
  }),
  historyDetailGridContainer: css({
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gridAutoFlow: 'row',
    flexGrow: 1,
    overflow: 'hiden',
    gap: '3px 1rem',
  }),
  date: css({
    margin: 0,
    '@media screen and (max-height: 900px)': {
      fontSize: '0.8rem',
    },
  }),
  name: css({
    margin: 0,
    fontFamily: 'Cafe24SsurroundAir',
    fontSize: '0.8rem',
    '@media screen and (max-height: 900px)': {
      fontSize: '0.8rem',
    },
  }),
};

type Props = {
  data: {
    year: number;
    details: {
      date: string;
      name: string;
    }[];
  };
};

const HistoryDetail: React.FC<Props> = (props) => {
  const {
    data: { year, details },
  } = props;
  return (
    <div key={year} className={styles.historyGridItem}>
      <h4 className={styles.year}>{year}</h4>
      <div className={styles.historyDetailGridContainer}>
        {details.map((detail) => (
          <Fragment key={detail.date}>
            <h5 className={styles.date}>{detail.date}</h5>
            <p className={styles.name}>{detail.name}</p>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

const History: React.FC = () => (
  <Page>
    <div className={cx([styles.main])}>
      <h2 className={styles.title}>Our History</h2>
      <div className={styles.historyGridContainer}>
        {historyData.map((history) => (
          <HistoryDetail key={history.year} data={history} />
        ))}
      </div>
    </div>
  </Page>
);

export default History;
