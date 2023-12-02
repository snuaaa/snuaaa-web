import React, { useState, ChangeEvent } from 'react';
import UserService from '../../services/UserService';
import { FindStateEnum } from '../../common/FindStateEnum';


type FindIdPwProps = {
    cancel: () => void
}

type FindInfoType = {
    idName: string,
    idEmail: string,
    pwId: string,
    pwName: string,
    pwEmail: string
}

const defaultFindInfo = {
  idName: '',
  idEmail: '',
  pwId: '',
  pwName: '',
  pwEmail: '',
};

function FindIdPw({ cancel }: FindIdPwProps) {

  const [findInfo, setFindInfo] = useState<FindInfoType>(defaultFindInfo);
  const [isFindId, setIsFindId] = useState<boolean>(true);
  const [findState, setFindState] = useState<number>(FindStateEnum.DEFAULT);


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFindInfo({
      ...findInfo,
      [e.target.name]: e.target.value
    });
  };

  const makeForm = () => {
    const { idName, idEmail, pwId, pwName, pwEmail } = findInfo;
    if (isFindId) {
      return (
        <>
          <div className="popup-input-unit">
            <label>이름</label>
            <input name="idName" type="text" onChange={handleChange} value={idName}></input>
          </div>
          <div className="popup-input-unit">
            <label>이메일</label>
            <input name="idEmail" type="text" onChange={handleChange} value={idEmail}></input>
          </div>
        </>
      );
    }
    else {
      return (
        <>
          <div className="popup-input-unit">
            <label>아이디</label>
            <input name="pwId" type="text" onChange={handleChange} value={pwId}></input>
          </div>
          <div className="popup-input-unit">
            <label>이름</label>
            <input name="pwName" type="text" onChange={handleChange} value={pwName}></input>
          </div>
          <div className="popup-input-unit">
            <label>이메일</label>
            <input name="pwEmail" type="text" onChange={handleChange} value={pwEmail}></input>
          </div>
        </>
      );
    }
  };

  const submit = async () => {
    const { idName, idEmail, pwId, pwName, pwEmail } = findInfo;

    setFindState(FindStateEnum.LOADING);

    if (isFindId) {
      const data = {
        name: idName,
        email: idEmail
      };
      try {
        await UserService.findId(data);
        setFindState(FindStateEnum.IDFOUND);
      }
      catch (err) {
        console.error(err);
        setFindState(FindStateEnum.IDNOTFOUND);
      }
    }
    else {
      const data = {
        id: pwId,
        name: pwName,
        email: pwEmail
      };
      try {
        await UserService.findPw(data);
        setFindState(FindStateEnum.PWFOUND);
      }
      catch (err) {
        console.error(err);
        setFindState(FindStateEnum.PWNOTFOUND);
      }
    }
  };

  const makeMessage = () => {

    if (findState === FindStateEnum.LOADING) {
      return <p>계정확인중</p>;
    }
    else if (findState === FindStateEnum.IDFOUND) {
      return <p>아이디를 회원님의 이메일로 보내드렸습니다.</p>;
    }
    else if (findState === FindStateEnum.IDNOTFOUND) {
      return <p>해당 정보와 일치하는 ID가 존재하지 않습니다.</p>;
    }
    else if (findState === FindStateEnum.PWFOUND) {
      return <p>임시 비밀번호를 회원님의 이메일로 보내드렸습니다.</p>;
    }
    else if (findState === FindStateEnum.PWNOTFOUND) {
      return <p>해당 정보와 일치하는 계정이 존재하지 않습니다.</p>;
    }
    else {
      return;
    }
  };


  const idSelectClass = `popup-selector ${isFindId ? 'selected' : ''}`;
  const pwSelectClass = `popup-selector ${isFindId ? '' : 'selected'}`;

  return (
    <div className="popup-wrapper">
      <div className="popup-box">
        <div className="popup-star">★</div>
        <div className="popup-selector-wrapper">
          <div className={idSelectClass} onClick={() => setIsFindId(true)}>아이디 찾기</div>
          <div className={pwSelectClass} onClick={() => setIsFindId(false)}>패스워드 찾기</div>
        </div>
        <div className="popup-contents">
          {makeForm()}
        </div>
        <div>{makeMessage()}</div>
        <div className="popup-action">
          {
            findState === FindStateEnum.IDFOUND || findState === FindStateEnum.PWFOUND ?
              <button className="btn-cancel" onClick={cancel}>닫기</button>
              :
              <>
                <button className="btn-ok" disabled={findState === FindStateEnum.LOADING} onClick={submit}>OK</button>
                <button className="btn-cancel" onClick={cancel}>CANCEL</button>
              </>
          }
        </div>
      </div>
    </div>
  );
}

export default FindIdPw;
