import { css, cx } from '@emotion/css';
import Image from '~/components/image';
import Page from '~/components/page';
import backgrondImg from '~/assets/img/dome_background.png';

const styles = {
  wrapper: css({
    display: 'relative',
    padding: '20rem',
    '@media screen and (max-width: 1200px)': {
      padding: '10rem',
      paddingLeft: '20rem',
    },
    '@media screen and (max-width: 800px)': {
      padding: '3rem',
    },
    '@media screen and (max-height: 600px)': {
      padding: '2rem',
    },
  }),
  title: css({
    fontSize: '2.5rem',
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadow: '1px 0 5px',
    '@media screen and (max-width: 800px)': {
      fontSize: '1.5rem',
      margin: '1rem 0',
    },
    '@media screen and (max-height: 600px)': {
      fontSize: '1.3rem',
      margin: '0.7rem 0',
    },
  }),
  content: css({
    color: '#FFFFFF',
    fontSize: '0.9rem',
    width: '60%',
    lineHeight: 1.4,
    '@media screen and (max-width: 1200px)': {
      width: '70%',
    },
    '@media screen and (max-width: 800px)': {
      width: '80%',
      fontSize: '0.8rem',
    },
    '@media screen and (max-height: 800px)': {
      width: '80%',
      fontSize: '0.7rem',
    },
    '@media screen and (max-height: 600px)': {
      width: '80%',
      fontSize: '0.6rem',
    },
  }),
  background: css({
    position: 'absolute',
    bottom: 0,
    width: '100%',
    mixBlendMode: 'soft-light',
    '@media screen and (max-width: 800px)': {
      width: '130%',
    },
  }),
};

const Dome: React.FC = () => (
  <Page>
    <div className={cx([styles.wrapper])}>
      <h3 className={cx([styles.title])}>김태영 기념 관측소</h3>
      <p className={cx([styles.content])}>
        김태영 기념 관측소는 AAA 관측 활동의 대부분이 일어나는 동아리 전용
        관측소입니다.
        <br />
        <br />
        김태영 기념 관측소에는 김태영 망원경을 비롯한 다수의 관측 장비가
        보관되어 있어 관측 시에 활발히 사용됩니다. 또한 사계절 내내 어두운
        야외에서 활동해야 하는 AAA원들의 따듯한 보금자리가 되어 주기도 합니다.
        <br />
        <br />
        아쉽게도 40여 년의 긴 역사를 김태영 기념 관측소가 모두 저장하고 있는
        것은 아닙니다. 1980년 동아리 발족 이후에는 줄곧 제1 관측소가 주된 활동
        장소로써 여러 선배님들의 열정과 추억을 함께 하였습니다. 그러나 학교 측의
        확장 공사로 인해 제1 관측소는 허물어졌고, 그 이후 전 지도교수 문승일
        선생님, 정운찬 총장님, 학교 관계자분들과 많은 AAA원들의 노력에 힘입어
        2004년 동아리의 김태영 기념 관측소가 개관하게 되었습니다.
        <br />
        <br />
        이렇듯 김태영 기념 관측소는 동아리의 아픔과 추모, 감사와 기쁨이 모두
        녹아 있는 우리만의 소중한 장소입니다. 김태영 기념 관측소는 앞으로도
        동아리의 추억을 함께하며 앞날을 향해 함께 걸어갈 것입니다.
      </p>
    </div>
    <div className={styles.background}>
      <Image src={backgrondImg} alt="backgroundImg" priority />
    </div>
  </Page>
);

export default Dome;
