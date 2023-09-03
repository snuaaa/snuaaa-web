import React, { useState, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { Prompt } from 'react-router';

const CardSuitEnum = {
  SPADE: 'S',
  CLOVER: 'C',
  HEART: 'H',
  DIAMOND: 'D',
  JOKER: 'J'
};

const CalculatorStateEnum = {
  INIT: 0,
  READY: 1,
  SET_USER: 2,
  SET_SET: 3,
  EDIT_SET: 4,
};

const InputStateEnum = {
  SELECT_DECLARER: 0,
  INPUT_PLEGE: 1,
  SELECT_FRIEND: 2,
  INPUT_FULFILLMENT: 3,
  END: 4
};

interface Card {
    id: string;
    suit: string;
    power: number;
}

interface MightyUser {
    id: number;
    name: string;
    setInfos: UserSetInfo[];
}

interface UserSetInfo {
    position: number;
    score: number;
}

interface MightySet {
    declarer: number;
    friend?: number;
    pledge: number;
    fulfillment: number;
    noKiruda: boolean;
    // kiruda?: string;
    // mighty: string;
    // ripper: string;
    // score: number;
}

interface MightyOption {
    max: number;
    nokiDouble: boolean;
    runDouble: boolean;
}

const defaultOptions: MightyOption = {
  max: 0,
  nokiDouble: true,
  runDouble: true
};

const defaultSet: MightySet = {
  declarer: 0,
  pledge: 13,
  fulfillment: 0,
  noKiruda: false,
  // score: 0
};


function MightyCalculator() {

  const [users, setUsers] = useState<MightyUser[]>([]);
  const [newUser, setNewUser] = useState<string>('');
  const [calState, setCalState] = useState<number>(CalculatorStateEnum.INIT);
  const [inputState, setInputState] = useState<number>(InputStateEnum.SELECT_DECLARER);
  const [allSetInfo, setAllSetInfo] = useState<MightySet[]>([]);
  const [currentSet, setCurrentSet] = useState<MightySet>(defaultSet);
  const [editingSet, setEditingSet] = useState<number>(-1);
  const [options, setOptions] = useState<MightyOption>(defaultOptions);

  useEffect(() => {
    if (inputState === InputStateEnum.END) {
      if (calState === CalculatorStateEnum.SET_SET) {
        setAllSetInfo(allSetInfo.concat({
          ...currentSet,
          // score: calculateScore(currentSet)
        }));
      }
      else if (calState === CalculatorStateEnum.EDIT_SET) {
        setAllSetInfo(allSetInfo.map((setInfo, index) => {
          if (index === editingSet) {
            return currentSet;
          }
          else {
            return setInfo;
          }
        }));
      }
      setCurrentSet(defaultSet);
      setCalState(CalculatorStateEnum.READY);
      setInputState(InputStateEnum.SELECT_DECLARER);
    }
  }, [inputState]);

  const calculateScore = (setInfo: MightySet) => {
    let defaultScore = 0;
    // The opposition party win
    if (setInfo.fulfillment < setInfo.pledge) {
      defaultScore = setInfo.fulfillment - setInfo.pledge;
      // Back Run
      if (setInfo.fulfillment < 10) {
        defaultScore *= 2;
      }
    }
    // The Ruling party win
    else {
      defaultScore = setInfo.fulfillment + setInfo.pledge - 26;
      // Full
      if (options.runDouble && (setInfo.pledge === 20 && setInfo.fulfillment === 20)) {
        defaultScore *= 2;
      }
      // No Kiruda
      if (options.nokiDouble && setInfo.noKiruda) {
        defaultScore *= 2;
      }
      if ((options.max > 0) && (options.max < defaultScore)) {
        defaultScore = options.max;
      }
    }

    return defaultScore;
  };

  const calculateUserScore = (allSetInfo: MightySet[], userId: number) => {
    let defaultScore = 0;
    allSetInfo.forEach(setInfo => {
      const setScore = calculateScore(setInfo);
      // No Friend
      if (!setInfo.friend) {
        if (setInfo.declarer === userId) {
          defaultScore += 4 * setScore;
        }
        else {
          defaultScore -= setScore;
        }
      }
      else {
        if (setInfo.declarer === userId) {
          defaultScore += 2 * setScore;
        }
        else if (setInfo.friend === userId) {
          defaultScore += setScore;
        }
        else {
          defaultScore -= setScore;
        }
      }
    });

    return defaultScore;
  };

  const makeTable = () => {
    return (
      <div className="enif-flex-center mighty-table-wrp">
        <table className="mighty-score-table mighty-table">
          <thead>

          </thead>
          <tbody>
            <tr>
              <th rowSpan={2}>회차</th>
              {
                users.map((user) => {
                  return (
                    <th key={user.id} colSpan={2} className={`member-${user.id}`}>
                      {user.name}
                    </th>
                  );
                })
              }
              <th rowSpan={2}>점수</th>
              <th rowSpan={2}>공약</th>
              <th rowSpan={2}>득점</th>
              <th rowSpan={2}>노기</th>
            </tr>
            <tr>
              {
                users.map((user) => {
                  return (
                    <th key={user.id} colSpan={2} className={`member-${user.id}`}>
                      {calculateUserScore(allSetInfo, user.id)}
                    </th>
                  );
                })
              }
            </tr>
            {
              allSetInfo.map((setInfo, index) => (
                <tr key={`s${index}`}>
                  <th>{index + 1}</th>
                  {
                    users.map((user) => {
                      const setScore = calculateScore(setInfo);
                      return (
                        <>
                          <td key={`s${index}-p${user.id}`} className={`member-${user.id}`}>
                            {user.id === setInfo.declarer ? '주' :
                              user.id === setInfo.friend ? '프' :
                                '야'}
                          </td>
                          <td key={`s${index}-s${user.id}`} className={`member-${user.id}`}>
                            {user.id === setInfo.declarer ? 2 * setScore :
                              user.id === setInfo.friend ? 1 * setScore :
                                -1 * setScore}
                          </td>
                        </>
                      );
                    })
                  }
                  <th>{calculateScore(setInfo)}</th>
                  <th>{setInfo.pledge}</th>
                  <th>{setInfo.fulfillment}</th>
                  <th>{setInfo.noKiruda ? 'O' : 'X'}</th>
                  <i className="ri-edit-fill enif-pointer action-icons"
                    onClick={() => {
                      setCalState(CalculatorStateEnum.EDIT_SET);
                      setInputState(InputStateEnum.SELECT_DECLARER);
                      setEditingSet(index);
                    }}></i>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  };

  const makeSelectUserList = (name: string) => {
    return (
      users.map((user) => <button key={user.id} className="mighty-btn" disabled={name === 'friend' && (currentSet.declarer === user.id)} onClick={handleSelect(name, user.id)} >{user.name}</button>
      )
    );
  };

  const handleInputUser = (e: ChangeEvent<HTMLInputElement>) => {
    setNewUser(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      addUser();
    }
  };

  const handleInput = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
    if (name === 'pledge') {
      setCurrentSet({
        ...currentSet,
        pledge: Number(e.target.value)
      });
    }
    else {
      setCurrentSet({
        ...currentSet,
        fulfillment: Number(e.target.value)
      });
    }
  };

  const checkInput = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentSet({
      ...currentSet,
      noKiruda: e.target.checked
    });
  };

  const handleSelect = (name: string, id: number) => () => {
    if (name === 'declarer') {
      setCurrentSet({
        ...currentSet,
        declarer: id
      });
    }
    else {
      setCurrentSet({
        ...currentSet,
        friend: id
      });
    }
    setInputState(inputState + 1);
  };

  const clickBtn = () => {
    if (inputState === InputStateEnum.INPUT_PLEGE) {
      if (currentSet.pledge < 13 || currentSet.pledge > 20) {
        alert('공약은 13에서 20사이어야 합니다.');
      }
      else {
        setInputState(inputState + 1);
      }
    }
    else if (inputState === InputStateEnum.INPUT_FULFILLMENT) {
      if (currentSet.pledge < 0 || currentSet.pledge > 20) {
        alert('이행은 0에서 20사이어야 합니다.');
      }
      else {
        setInputState(inputState + 1);
      }
    }
    else {
      console.error('Invalid Input');
    }
  };

  const addUser = () => {
    setUsers(users.concat({
      id: users.length + 1,
      name: newUser,
      setInfos: []
    }));
    setNewUser('');
    if (users.length === 4) {
      setCalState(CalculatorStateEnum.READY);
    }
  };

  return (
    <>
      <Prompt when={true} message="페이지를 나가면 기록은 저장되지 않습니다. 나가시겠습니까?" />
      <div className="mighty-options-wrapper">
        <h5>점수 옵션</h5>
        <div className="mighty-options">
          <div className="mighty-option">
            <input id="nokiDouble" type="checkbox" checked={options.nokiDouble} onChange={(e) => setOptions({ ...options, nokiDouble: e.target.checked })}></input>
            <label htmlFor="nokiDouble">노기2배</label>
          </div>
          <div className="mighty-option">
            <input id="runDouble" type="checkbox" checked={options.runDouble} onChange={(e) => setOptions({ ...options, runDouble: e.target.checked })}></input>
            <label htmlFor="runDouble">런2배</label>
          </div>
          <div className="mighty-option">
            <label className="label-wrp" htmlFor="max">최대점수
              <input id="max" type="number" value={options.max} onChange={(e) => setOptions({ ...options, max: Number(e.target.value) })}></input>
            </label>
          </div>
        </div>
      </div>
      {
        calState === CalculatorStateEnum.INIT &&
                <>
                  <div className="mighty-header-wrp">
                    <h5>참여하는 사람의 이름을 입력해 주세요.</h5>
                  </div>
                  <div className="enif-flex-center">
                    <input type="text" className="mighty-input" onChange={handleInputUser} onKeyDown={handleKeyDown} value={newUser} />
                    <button className="mighty-btn" onClick={addUser}>추가</button>
                  </div>
                </>
      }
      {
        calState === CalculatorStateEnum.READY &&
                <>
                  <div className="mighty-header-wrp">
                    <button className="mighty-btn" onClick={() => setCalState(CalculatorStateEnum.SET_SET)}>세트 정보 입력</button>
                  </div>
                </>
      }
      {
        calState === CalculatorStateEnum.SET_SET &&
                <>
                  <div className="mighty-header-wrp">
                    {
                      inputState > 0 &&
                            <i className="ri-arrow-left-circle-line mighty-btn-back" onClick={() => setInputState(inputState - 1)}></i>
                    }

                    <h5>
                      {
                        inputState === InputStateEnum.SELECT_DECLARER ? '주공을 선택하세요.'
                          : inputState === InputStateEnum.INPUT_PLEGE ? '공약을 입력하세요.'
                            : inputState === InputStateEnum.SELECT_FRIEND ? '프렌드를 선택하세요.'
                              : inputState === InputStateEnum.INPUT_FULFILLMENT ? '여당이 획득한 점수를 입력하세요.'
                                : ''
                      }
                    </h5>
                  </div>
                  <div className="enif-flex-center">
                    {
                      inputState === InputStateEnum.SELECT_DECLARER ? <>{makeSelectUserList('declarer')}</>
                        : inputState === InputStateEnum.INPUT_PLEGE ?
                          <>
                            <label className="mighty-toggle" htmlFor="kiruda">노기루다</label>
                            <input id="kiruda" name="kiruda" type="checkbox" checked={currentSet.noKiruda} onChange={checkInput} />
                            <input type="number" min={13} max={20} className="mighty-input" value={currentSet.pledge} onChange={handleInput('pledge')} />
                            <button className="mighty-btn" onClick={clickBtn}>다음</button>
                          </>
                          : inputState === InputStateEnum.SELECT_FRIEND ? <>{makeSelectUserList('friend')}</>
                            : inputState === InputStateEnum.INPUT_FULFILLMENT ?
                              <>
                                <input type="number" min={0} max={20} className="mighty-input" value={currentSet.fulfillment} onChange={handleInput('fulfillment')} />
                                <button className="mighty-btn" onClick={clickBtn}>다음</button>
                              </>
                              : ''
                    }
                  </div>
                </>
      }
      {
        calState === CalculatorStateEnum.EDIT_SET &&
                <div className="enif-popup">
                  <div className="enif-popup-content">
                    <div className="mighty-header-wrp">
                      <h5>
                        {
                          inputState === InputStateEnum.SELECT_DECLARER ? '주공을 선택하세요.'
                            : inputState === InputStateEnum.INPUT_PLEGE ? '공약을 입력하세요.'
                              : inputState === InputStateEnum.SELECT_FRIEND ? '프렌드를 선택하세요.'
                                : inputState === InputStateEnum.INPUT_FULFILLMENT ? '여당이 획득한 점수를 입력하세요.'
                                  : ''
                        }
                      </h5>
                    </div>
                    <div className="enif-flex-center">
                      {
                        inputState === InputStateEnum.SELECT_DECLARER ? <>{makeSelectUserList('declarer')}</>
                          : inputState === InputStateEnum.INPUT_PLEGE ?
                            <>
                              <label className="mighty-toggle" htmlFor="kiruda">노기루다</label>
                              <input id="kiruda" name="kiruda" type="checkbox" checked={currentSet.noKiruda} onChange={checkInput} />
                              <input type="number" min={13} max={20} className="mighty-input" value={currentSet.pledge} onChange={handleInput('pledge')} />
                              <button className="mighty-btn" onClick={clickBtn}>다음</button>
                            </>
                            : inputState === InputStateEnum.SELECT_FRIEND ? <>{makeSelectUserList('friend')}</>
                              : inputState === InputStateEnum.INPUT_FULFILLMENT ?
                                <>
                                  <input type="number" min={0} max={20} className="mighty-input" value={currentSet.fulfillment} onChange={handleInput('fulfillment')} />
                                  <button className="mighty-btn" onClick={clickBtn}>다음</button>
                                </>
                                : ''
                      }
                    </div>
                  </div>
                </div>
      }
      {makeTable()}
    </>
  );
}

export default MightyCalculator;