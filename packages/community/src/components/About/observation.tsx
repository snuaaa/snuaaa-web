import React from 'react';
import domImg from 'assets/img/dome.jpg';

function Ovservation() {

  return (
    <div className="intro-div-wrapper" id="observation">
      <h3>김태영 기념 관측소 소개</h3>
      <div className="intro-content">
        <div className='img-right'>
          <img src={domImg} alt="dom" />
          <p>We ♡ Dome! 09곽세종 작</p>
        </div>
        <p>
                    &nbsp;김태영 기념 관측소는 AAA 관측활동의 대부분이 일어나는 동아리 전용 관측소 입니다.<br />
          <br />
                    &nbsp;김태영 기념 관측소에는 김태영 망원경을 비롯한 다수의 관측 장비가 보관되어 있어 관측 시에
                        활발히 사용됩니다. 또한 사계절 내내 어두운 야외에서 활동해야 하는 AAA원들의 따뜻한 보금자리가 되어 주기도 합니다.<br />
          <br />
                    &nbsp;아쉽게도 30여 년의 긴 역사를 김태영 기념 관측소가 모두 저장하고 있는 것은 아닙니다. 1980년 동아리 발족 이후에는
                    줄곧 제1 관측소가 주된 활동 장소로써 여러 선배님들의 열정과 추억을 함께 하였습니다. 그러나 학교 측의
                    확장 공사로 인해 제1 관측소는 허물어졌고, 그 이후 전 지도교수 문승일 선생님, 정운찬 총장님, 학교 관계자분들과
                        많은 AAA원들의 노력에 힘입어 2004년 동아리의 김태영 기념 관측소가 개관하게 되었습니다.<br />
          <br />
                    &nbsp;이렇듯 김태영 기념 관측소는 동아리의 아픔과 추모, 감사와 기쁨이 모두 녹아 있는 우리만의 소중한 장소입니다.
                    김태영 기념 관측소는 앞으로도 동아리의 추억을 함께 하며 앞날을 향해 함께 걸어갈 것입니다.
        </p>
      </div>
    </div>
  );
}

export default Ovservation;
