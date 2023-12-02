import React, { RefObject } from 'react';
import { Link } from 'react-router-dom';
declare const kakao: any;

class Contact extends React.Component {

  mapRef: RefObject<HTMLDivElement>;

  constructor(props: any) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {

    const position = new kakao.maps.LatLng(37.459473, 126.950562);
    const options = {
      center: position,
      level: 3
    };

    const kakaoMap = new kakao.maps.Map(this.mapRef.current, options);
    const marker = new kakao.maps.Marker({
      position: position
    });
    marker.setClickable(true);
    marker.setTitle('서울대학교 아마추어 천문회');
    marker.setMap(kakaoMap);
  }

  render() {
    return (
      <div className="intro-div-wrapper" id="contact">
        <h3>Contact Us</h3>
        <div className="intro-contact-wrapper">
          <div ref={this.mapRef} className="kakao-map"></div>
          <a className="link-navi" href="https://map.kakao.com/link/to/17561274">
            <i className="ri-guide-line enif-f-1x"></i>길 찾기
          </a>
          <h4>서울대학교 아마추어 천문회<br />
                        Amateur Astronomy Association
          </h4>

          <p className="intro-content">
            {/* 08826<br /> */}
                        서울특별시 관악구 관악로 1,<br /> 서울대학교 학생회관 63동 611호 (08826)<br />
            {/* Seoul National University, Students' union, Building 63, 6F, 611<br /> */}
                        Rm. 611, Bldg. 63 (Students&apos; Union), Seoul National University<br />
                        1, Gwanak-ro, Gwanak-gu, Seoul 08826, KR<br />
            <br />
                        www.snuaaa.net<br />
                        02-874-9374<br />
          </p>
          <div className="intro-contact-btn-wrapper">
            <Link to="/board/brd92">
              <button>방명록 남기기</button>
            </Link>
          </div>

        </div>
      </div>
    );
  }
}

export default Contact;