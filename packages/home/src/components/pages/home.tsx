import { css } from '@emotion/css';
import usePage from '~/hooks/usePage';
import Page from '~/components/page';
import Image from '~/components/image';
import logo from '~/assets/img/aaa.png';

const styles = {
  title: css({
    fontFamily: 'Cafe24Ssurround',
    fontSize: '1.8rem',
    textAlign: 'center',
    color: '#FFFFFF',
    margin: 0,
    '@media screen and (max-width: 860px)': {
      fontSize: '1.2rem',
    },
  }),
  logo: css({
    height: 500,
    width: 500,
    '@media screen and (max-width: 860px)': {
      height: 250,
      width: 250,
    },
  }),
  buttonWrp: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '@media screen and (max-width: 860px)': {
      flexDirection: 'column',
    },
    '& button': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#FFFFFF',
      borderRadius: '1.5rem',
      padding: '1rem 2rem 0.8rem 2rem',
      margin: '0.5rem 1rem',
      width: '10rem',
      '&:hover': {
        backgroundColor: '#4985A7',
      },
      '&:active': {
        backgroundColor: '#4985A7',
      },
    },
  }),
};

const Home: React.FC = () => {
  const { next } = usePage();

  return (
    <Page>
      <h1 className={styles.title}>서울대학교 아마추어 천문회</h1>
      <span className={styles.logo}>
        <Image src={logo} alt="aaa" />
      </span>
      <div className={styles.buttonWrp}>
        <button type="button" onClick={next}>
          동아리 소개
        </button>
        <a href="https://our.snuaaa.net/" rel="noopener noreferrer">
          <button type="button">커뮤니티</button>
        </a>
        <a href="https://archive.snuaaa.net/" rel="noopener noreferrer">
          <button type="button">옛 커뮤니티</button>
        </a>
      </div>
    </Page>
  );
};

export default Home;
