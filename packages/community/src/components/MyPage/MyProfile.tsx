import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AaaImage from '../Common/AaaImage';
import imgDefaultProfile from 'assets/img/common/profile.png';
import { breakLine } from '../../utils/breakLine';
import UserType from '../../types/UserType';
import { gradeAssigner } from '../../utils/gradeAssigner';
import defaultProfile from 'assets/img/common/profile.png';

type MyProfileProps = {
    userInfo: UserType;
    isCanEdit: boolean;
}

const gradeSet = [
  {
    grade: 1,
    role: '관리자'
  },
  {
    grade: 3,
    role: '운영진'
  },
  {
    grade: 4,
    role: '전 회장'
  },
  {
    grade: 5,
    role: '회장'
  },
  {
    grade: 6,
    role: '임원'
  },
  {
    grade: 7,
    role: '정회원/OB'
  },
  {
    grade: 8,
    role: '준회원'
  },
  {
    grade: 9,
    role: '비회원'
  }
];

function makeGradeList() {
  return gradeSet.map((info) => {
    return (
      <div className="grade-unit">
        <div className="profile-img-wrapper with-border">
          <div className={`profile-img-border grade${info.grade}`}>
            <AaaImage className="profile-img" defaultImgSrc={defaultProfile} />
          </div>
        </div>
        <p>{info.grade} {gradeAssigner(info.grade)}</p>
        <p>{info.role}</p>
      </div>
    );
  });
}

function MyProfile({ userInfo, isCanEdit }: MyProfileProps) {

  const [isExpand, setIsExpand] = useState(false);

  const descClass = isExpand ? 'userdesc expanded' : 'userdesc';
  const iconClass = isExpand ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line';

  return (
    <div className="my-profile-wrapper">
      <div className="my-left">
        <div className="profile-img-wrapper with-border">
          <div className={`profile-img-border grade${userInfo.grade ? userInfo.grade : 9}`}>
            <AaaImage className="profile-img" imgSrc={userInfo.profile_path} defaultImgSrc={imgDefaultProfile} />

          </div>
        </div>
        <div className="profile-img">
        </div>
        <div className="nickname">{userInfo.nickname}</div>
        <div className="aaa-no">{userInfo.aaa_no}</div>

        {isCanEdit &&
                    <div className="btn-edit-info">
                      <Link to="profile">
                        <button>회원정보 수정</button>
                      </Link>
                    </div>
        }
      </div>
      <div className="enif-divider"></div>
      <div className="my-right">
        <div className="my-profile-infos-wrapper">
          <div className="my-profile-infos-unit">
            <div className="my-profile-infos-label">등급</div>
            <div className="my-profile-infos-data">{userInfo.grade} {gradeAssigner(userInfo.grade)}</div>
            <i className="ri-question-line question-icon">
              {/* <div className="grade-list-popup-wrp"> */}
              <div className="grade-list-popup">
                <h5>등급 정보</h5>
                {makeGradeList()}
              </div>
              {/* </div> */}
            </i>
          </div>
          <div className="my-profile-infos-unit">
            <div className="my-profile-infos-label">이메일</div>
            <div className="my-profile-infos-data">{userInfo.email}</div>
          </div>
          {
            userInfo.col_no &&
                        <div className="my-profile-infos-unit">
                          <div className="my-profile-infos-label">학번</div>
                          <div className="my-profile-infos-data">{userInfo.col_no} 학번</div>
                        </div>
          }
          {
            userInfo.major &&
                        <div className="my-profile-infos-unit">
                          <div className="my-profile-infos-label">전공</div>
                          <div className="my-profile-infos-data">{userInfo.major}</div>
                        </div>
          }
          <div className="my-profile-infos-unit">
            <div className="my-profile-infos-label">자기소개</div>
            <div className="my-profile-infos-data">
              <div className={descClass}>{breakLine(userInfo.introduction)}</div>
              <div className="icon-expand">
                <i className={`${iconClass} enif-pointer`} onClick={() => setIsExpand(!isExpand)}></i>
              </div>
            </div>
          </div>
        </div>
        {/* <div className={descClass}>{breakLine(userInfo.introduction)}</div>
                <div className="icon-expand">
                    <i className={`${iconClass} enif-pointer`} onClick={() => setIsExpand(!isExpand)}></i>
                </div> */}
      </div>
    </div>
  );
}

export default MyProfile;