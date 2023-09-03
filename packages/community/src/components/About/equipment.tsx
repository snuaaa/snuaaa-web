import React from 'react';
import mt200 from 'assets/img/about/mt200.jpg';
import sanghui from 'assets/img/about/sanghui.jpg';
import fourteenpointfiveinch from 'assets/img/about/14.5inch.jpg';
import gwak from 'assets/img/about/gwak.jpg';
import fs102 from 'assets/img/about/fs102.jpg';
import c925 from 'assets/img/about/c9.25.jpg';

function Equipment() {

  return (
    <div className="intro-div-wrapper" id="equipment">
      <h3>장비 소개</h3>
      <div className="intro-content">
        <div className="equipment-wrp">
          <h5>&nbsp;1) 김태영 망원경 (MT-200)</h5>
          <p>
            <img className="img-left" src={mt200} alt="MT-200" />
              &nbsp;김태영 망원경은 관측소 2층에 고정된 동아리의 대표 망원경입니다. 이 망원경의 이름은
              1999년 9월 원자핵 공학과 실험실 사고로 돌아가신 89학번 김태영 선배님의 이름을 따서 붙여졌습니다.
              평소 동아리에 아낌없는 사랑을 보여주신 김태영 선배님이었기에 김태영 선배님의 아버님은 AAA에
              망원경과 여러 장비를 기증해 주셨습니다. 그 망원경 MT-200은 김태영 망원경의 이름으로 지금까지 동아리와
              함께 밤하늘을 지켜보고 있습니다.<br /><br />
              &nbsp;김태영 망원경은 구경 8인치, F수 6(초점거리 1219mm)에 해당하는 뉴턴식 반사 망원경입니다.
              돔 내부에 고정식으로 보관되어 안정적이고 편리한 사용이 가능합니다.
          </p>
        </div>
        <div className="equipment-wrp">
          <h5>&nbsp;2) 상희</h5>
          <p>
            <img className="img-right img-sanghui" src={sanghui} alt="SangHui" />
              &nbsp;상희는 94학번 곽상혁 선배님께서 1996년도에 제작하신 동아리의 안시용 망원경입니다.
              10인치급 수제작 망원경 중에서는 동아리 최초의 작품이며 오랜 시간 동안 동아리의 관측을 함께
              하였습니다. 현재는 많이 노화되어 관측에는 잘 사용되지 않지만 &apos;상희&apos;라는 이름에서는 여전히
              곽상혁 선배님과 동아리원들이 딸처럼 아껴주는 애정을 느낄 수 있습니다.<br /><br />
              &nbsp;상희는 구경 10인치, F수 6(초점거리 1524mm)의 뉴턴식 반사 망원경입니다. 돕소니언식으로
              제작되어 조작법이 직관적이고 편리합니다.<br /><br />
          </p>
        </div>
        <div className="equipment-wrp">

          <h5>&nbsp;3) 14.5inch</h5>
          <p>
            <img className="img-left img-sanghui" src={fourteenpointfiveinch} alt="14.5inch" />
              &nbsp;14.5inch는 2005년에 결성된 망원경 제작 모임(99김재호, 99전태영, 00배동환, 01김현수, 03김중규,
              03임수현, 04김형철, 04오세창, 05정찬영)의 결실입니다. 차세대 대구경 망원경을 만들고자 하는 선배들의 뜻에
                  걸맞게 현재까지도 동아리 최대 구경 망원경으로 관측에 활발히 이용되고 있습니다.<br /><br />
              &nbsp;14.5inch는 구경 14.5인치, F수 4.26(초점거리 1570mm)의 뉴턴식 반사 망원경입니다. 대구경의 망원경으로
              해상력이 좋고 밝으며, 초점거리가 길어 확대능도 뛰어납니다.<br /><br />
          </p>
        </div>
        <div className="equipment-wrp">
          <h5>&nbsp;4) 곽</h5>
          <p>
            <img className="img-right img-gwak" src={gwak} alt="Gwak" />
              &nbsp;곽은 09학번 곽세종 선배님의 주도하에 동아리원들이 2014년에 제작한 망원경입니다. 곽은 기존 망원경들보다
              무게가 가볍고 휴대성이 좋아 평상시는 물론, 원정 관측시에도 자주 이용됩니다. 또한 편리한 설치법과 세련된 디자인
              또한 곽이 지니는 장접으로 꼽힙니다.<br /><br />
              &nbsp;곽은 구경 10인치, F수 4.3(초점거리 1090mm)의 뉴턴식 반사 망원경입니다. 성능과 더불어 사용자의 편의를 고려한 망원경으로
              현재 가장 많이 이용되는 장비 중 하나입니다.<br /><br />
          </p>
        </div>
        <div className="equipment-wrp">
          <h5>&nbsp;5) FS-102</h5>
          <p>
            <img className="img-left" src={fs102} alt="FS-102" />
              &nbsp; FS-102는 일본 다카하시(Takahashi)사의 제품입니다. FS-102의 렌즈는 특수한 재질로 제작되어
                  관측 시의 색수차를 줄여주고, 굴절 망원경 특유의 안정적인 상을 보여주어 천체사진 촬영에 자주 이용되었습니다.<br />
              &nbsp; FS-102는 구경 4인치, F수 8(초점거리 820mm)의 케플러식 굴절 망원경입니다. x0.75 리듀서를 이용하면
              조금 더 밝은 상을 관측할 수 있습니다.<br /><br /><br /><br />
          </p>
        </div>
        <div className="equipment-wrp">
          <h5>&nbsp;6) C9.25</h5>
          <p>
            <img className="img-right" src={c925} alt="C9.25" />
              &nbsp; C9.25는 기존에 사진용 망원경으로 이용되었던 FS-102를 상향 대체하고자 2016년 새롭게 구매한 Celestron 사의 제품입니다.
              동아리의 사진 활동이 점차 발전하면서 기존보다 밝고 우수한 광학계의 필요성이 대두되었고, 동아리원의 의견을 모은 끝에 최적의
              후보로 C9.25가 결정되었습니다. 이 과정에서 동아리 30주년을 맞아 86학번 선배님들(김석준, 김호철, 김명하, 류정아, 손동기,
                오세준, 여인호, 최경숙, 한영신, 홍승훈)께서 전해주신 기금이 큰 도움이 되었으므로 감사를 표합니다.<br />
              &nbsp; C9.25는 구경 9.25인치, F수 10(초점거리 2350mm)의 슈미트-카세그레인식 반사 망원경입니다. 하이퍼스타를 이용할 시에
              F수가 2.3(초점거리 540mm)으로 줄어들어 밝은 상을 관측하기에 적합합니다. 현재 행성 관측과 가이드 촬영에 활발히 사용되고 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Equipment;