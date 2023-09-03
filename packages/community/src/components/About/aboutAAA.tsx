import React from 'react';
import logoImg from 'assets/img/logo_blue.png';

function AboutAAA() {

  return (
    <div className="intro-div-wrapper" id="about">
      <h3>아마추어 천문 동아리 AAA</h3>
      <p className="intro-content">
        <img className='img-right img-logo' src={logoImg} alt="logo" />
                &nbsp; AAA(Amateur Astronomy Association)는 아마추어 천문활동을 사랑하는
                회원들이 모여 구성한 서울대학교의 중앙 동아리입니다. 1980년 자연대 동아리로
                시작하여 40년이 지난 현재까지 계속되어 온만큼 유구한 역사를 자랑합니다.
        <br /><br />&nbsp;
                AAA의 활동은 주로 동아리방(별방)과 김태영 기념 관측소에서 이루어집니다. 매주
                열리는 정기모임과 비정기적인 관측 활동을 비롯하여 신입생들을 위한 교육 프로그램까지,
                아마추어 천문을 즐기기 위한 활동을 활발히 진행하고 있습니다. 1년간의 천문 활동은 천체사진 작품으로
                남아 매년 하반기 사진전을 통해 대외에 공개됩니다.
        <br /><br />&nbsp;
                오랜 시간 관측을 함께해 온 망원경 옆과 소중한 관측소 안에는 언제나 천문의 낭만을
                품고있는 AAA원들이 있습니다. 이 홈페이지가 담고있는 수많은 사진과 대화들은 우리가
                지나온 밤들을 기억하지요.
        <br /><br />&nbsp;
                오늘 밤 저희와 함께 또 다른 추억을 남겨 보는 것은 어떠신가요?
                기나긴 역사와 빛나는 현재를 가진 AAA는 밤하늘을 사랑하는 모든 이들을 환영합니다.
      </p>
    </div>
  );
}

export default AboutAAA;