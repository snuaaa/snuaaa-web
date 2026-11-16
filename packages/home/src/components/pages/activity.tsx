import { css, cx } from '@emotion/css';
import Image from '~/components/image';
import Page from '~/components/page';
import line from '~/assets/img/line.png';
import { useCallback } from 'react';
import imgDidimdol from '~/assets/img/activity/didimdol.png';
import imgByul from '~/assets/img/activity/byul.png';
import imgObservation from '~/assets/img/activity/observation.png';
import imgTakingPictures from '~/assets/img/activity/taking_pictures.png';
import imgExhibition from '~/assets/img/activity/exhibition.png';
import imgFriendship from '~/assets/img/activity/friendship.png';
import ActivityDetail from './activityDetail';

const styles = {
  main: css({
    height: '100%',
    width: '100%',
    padding: '20rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    color: '#FFFFFF',
    '@media screen and (max-width: 800px)': {
      padding: '5rem',
    },
  }),
  contentWrapper: css({
    display: 'block',
    textAlign: 'center',
    alignItems: 'center',
    paddingBottom: '5rem',
  }),
  title: css({
    fontSize: '2.25rem',
    color: 'white',
    fontFamily: '"Snowburst One", cursive',
  }),
  imageWrapper: css({
    position: 'relative',
    width: 'calc(100% - 10rem)',
    maxWidth: '50rem',
    '@media screen and (max-width: 1200px)': {
      width: 'calc(100% - 3rem)',
    },
    '@media screen and (max-width: 800px)': {
      width: '100%',
    },
  }),
};

const details = [
  {
    index: 1,
    left: '-5%',
    top: '-40%',
    name: '디딤돌',
    starWidth: 66,
    starHeight: 60,
    starTranform: 'rotate(0.85deg)',
    detailImg: imgDidimdol,
    detailDescription:
      '동아리 신입생이 어울릴 수 있는 자리를 제공하고 간단한 아마추어 천문 지식을 전달하는 활동입니다.',
  },
  {
    index: 2,
    left: '13%',
    top: '100%',
    name: '별모임',
    starWidth: 74,
    starHeight: 64,
    starTranform: 'rotate(-41.34deg)',
    detailImg: imgByul,
    detailDescription:
      '매주 모여 관측을 하거나 아마추어 천문에 대한 지식을 공유하는 자리입니다.',
  },
  {
    index: 3,
    left: '37%',
    top: '20%',
    name: '소규모\n관측회',
    starWidth: 57,
    starHeight: 51,
    starTranform: 'rotate(123.55deg)',
    detailImg: imgObservation,
    detailDescription:
      '날씨가 좋은 날엔 최적의 관측 환경을 찾아 무박 2일의 관측 여행을 떠납니다. 동아리 활동의 꽃이라 할 수 있습니다.',
  },
  {
    index: 4,
    left: '58%',
    top: '70%',
    name: '출사',
    starWidth: 49,
    starHeight: 45,
    starTranform: 'rotate(22.17deg)',
    detailImg: imgTakingPictures,
    detailDescription:
      '학교 근처, 서울 근교의 멋진 풍경을 찾아서 천체사진을 촬영하는 활동입니다.',
  },
  {
    index: 5,
    left: '79%',
    top: '-10%',
    name: '사진전',
    starWidth: 87,
    starHeight: 77,
    starTranform: 'rotate(0deg)',
    detailImg: imgExhibition,
    detailDescription:
      '1년간 동아리원들이 맞이한 다채롭고 아름다운 밤하늘을 사진으로 담아 전시하는 자리입니다.',
  },
  {
    index: 6,
    left: '103%',
    top: '60%',
    name: '친목활동',
    starWidth: 51,
    starHeight: 44,
    starTranform: 'rotate(-62.87deg)',
    detailImg: imgFriendship,
    detailDescription:
      '관측활동 이외에도 MT와 다양한 모임 등 다양한 친목도모 활동도 진행하고 있습니다!',
  },
];

const Activity: React.FC = () => {
  const makeActivityDetails = useCallback(
    () =>
      details.map((detail) => (
        <ActivityDetail
          key={`activity-detail-${detail.index}`}
          index={detail.index}
          top={detail.top}
          left={detail.left}
          name={detail.name || ''}
          starHeight={detail.starHeight}
          starWidth={detail.starWidth}
          starTranform={detail.starTranform}
          detailImg={detail.detailImg}
          detailDescription={detail.detailDescription}
        />
      )),
    [],
  );

  return (
    <Page>
      <div className={cx([styles.main])}>
        <div className={styles.contentWrapper}>
          <p className={styles.title}>Our Activities</p>
          <p>AAA의 활동은 별방과 관측소 등에서 이루어집니다.</p>
          <p>별들을 클릭하여 AAA의 다양한 활동들을 알아보세요!</p>
        </div>
        <div className={styles.imageWrapper}>
          {makeActivityDetails()}
          <Image src={line} alt="line" priority />
        </div>
      </div>
    </Page>
  );
};

export default Activity;
