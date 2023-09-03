import React, { useEffect, useState, MouseEvent } from 'react';
import UserService from '../../services/UserService';
import UserType from '../../types/UserType';
import { convertFullDate, convertDateWithDay } from '../../utils/convertDate';
import { UsersSearchType } from '../../types/SearchTypes';
import Paginator from '../Common/Paginator';
import { useLocation, useHistory } from 'react-router';

const USER_ROW_NUM = 20;

function MgtUser() {

  const [userInfo, setUserInfo] = useState<UserType[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [pageIdx, setPageIdx] = useState<number>(1);
  const [searchOption, setSearchOption] = useState<UsersSearchType>({ sort: '', order: '' });
  const history = useHistory();
  // const location = useLocation();

  useEffect(() => {
    fetch();
  }, [searchOption]);

  const fetch = async () => {
    try {
      const res = await UserService.retrieveUsers(searchOption);
      setUserInfo(res.data.userInfo);
      setUserCount(res.data.count);
    }
    catch (err) {
      console.error(err);
      if ((err as any).response && (err as any).response.status === 403) {
        alert('권한이 없습니다.');
        history.goBack();
      }
    }
  };

  const makeUserList = () => {
    if (userInfo && userInfo.length > 0) {
      return userInfo.map((user) => {
        return (
          <tr key={user.user_uuid}>
            <td className={isSorted('id') ? 'selected' : ''}>{user.id}</td>
            <td className={isSorted('nickname') ? 'selected' : ''}>{user.nickname}</td>
            <td className={isSorted('aaa_no') ? 'selected' : ''}>{user.aaa_no}</td>
            <td className={isSorted('grade') ? 'selected' : ''}>{user.grade}</td>
            <td className={isSorted('created_at') ? 'selected' : ''}>{convertDateWithDay(user.created_at)}</td>
            <td className={isSorted('login_at') ? 'selected' : ''}>{convertFullDate(user.login_at)}</td>
          </tr>
        );
      });
    }
  };

  const isSorted = (sort: string) => {
    if (searchOption && searchOption.sort === sort) {
      return true;
    }
    else {
      return false;
    }
  };

  const makeArrow = (sort: string) => {
    if (searchOption && searchOption.sort === sort) {
      if (searchOption.order === 'ASC') {
        return (
          <i className="ri-arrow-drop-up-line"></i>
        );
      }
      else {
        return (
          <i className="ri-arrow-drop-down-line"></i>
        );
      }
    }
  };

  const clickSearchOption = (sort: string) => (e: MouseEvent<HTMLTableHeaderCellElement>) => {
    setSearchOption({
      sort: sort,
      order: searchOption
                && searchOption.sort === sort
                && searchOption.order === 'ASC'
        ? 'DESC' : 'ASC'
    });
    setPageIdx(1);
  };

  const clickPage = (idx: number) => {
    setPageIdx(idx);
    setSearchOption({
      ...searchOption,
      limit: USER_ROW_NUM,
      offset: (idx - 1) * USER_ROW_NUM
    });
    // history.push({
    //     state: {
    //         ...location.state,
    //         page: idx
    //     }
    // })
  };

  // let pageIdx = location.state && location.state.page ? location.state.page : 1;

  return (
    <div className="mgt-user-wrp">
      <h4>회원 관리</h4>
      <div className="mgt-user-table-wrp">
        <table className="mgt-user-table">
          <thead></thead>
          <tbody>
            <tr>
              <th id="id" onClick={clickSearchOption('id')} >아이디{makeArrow('id')}</th>
              <th id="nickname" onClick={clickSearchOption('nickname')}>닉네임{makeArrow('nickname')}</th>
              <th id="aaa_no" onClick={clickSearchOption('aaa_no')}>가입번호{makeArrow('aaa_no')}</th>
              <th id="grade" onClick={clickSearchOption('grade')}>등급{makeArrow('grade')}</th>
              <th id="created_at" onClick={clickSearchOption('created_at')}>가입일{makeArrow('created_at')}</th>
              <th id="login_at" onClick={clickSearchOption('login_at')}>최근로그인{makeArrow('login_at')}</th>
            </tr>
            {makeUserList()}
          </tbody>
        </table>
      </div>
      <Paginator pageIdx={pageIdx} pageNum={Math.ceil(userCount / USER_ROW_NUM)} clickPage={clickPage} />
    </div>
  );
}

export default MgtUser;
