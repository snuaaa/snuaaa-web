import { convertFullDate, convertDateWithDay } from '~/utils/convertDate';
import { UsersSearchType } from '~/types/SearchTypes';
import Paginator from '~/components/Common/Paginator';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useUserList } from '~/hooks/queries/useUserQueries';

const USER_ROW_NUM = 20;

function UserManagement() {
  const searchParams = useSearch({ from: '/admin/user' });
  const navigate = useNavigate({ from: '/admin/user' });

  const pageIdx = searchParams.page || 1;
  const searchOption: UsersSearchType = {
    sort: searchParams.sort || '',
    order: searchParams.order || '',
    limit: USER_ROW_NUM,
    offset: (pageIdx - 1) * USER_ROW_NUM,
  };

  const { data } = useUserList(searchOption);
  const userInfo = data?.userInfo ?? [];
  const userCount = data?.count ?? 0;

  const makeUserList = () => {
    if (userInfo && userInfo.length > 0) {
      return userInfo.map((user) => {
        return (
          <tr key={user.user_uuid}>
            <td className={isSorted('id') ? 'selected' : ''}>{user.id}</td>
            <td className={isSorted('nickname') ? 'selected' : ''}>
              {user.nickname}
            </td>
            <td className={isSorted('aaa_no') ? 'selected' : ''}>
              {user.aaa_no}
            </td>
            <td className={isSorted('grade') ? 'selected' : ''}>
              {user.grade}
            </td>
            <td className={isSorted('created_at') ? 'selected' : ''}>
              {convertDateWithDay(user.created_at)}
            </td>
            <td className={isSorted('login_at') ? 'selected' : ''}>
              {convertFullDate(user.login_at)}
            </td>
          </tr>
        );
      });
    }
  };

  const isSorted = (sort: string) => {
    if (searchOption && searchOption.sort === sort) {
      return true;
    } else {
      return false;
    }
  };

  const makeArrow = (sort: string) => {
    if (searchOption && searchOption.sort === sort) {
      if (searchOption.order === 'ASC') {
        return <i className="ri-arrow-drop-up-line"></i>;
      } else {
        return <i className="ri-arrow-drop-down-line"></i>;
      }
    }
  };

  const clickSearchOption = (sort: string) => () => {
    const nextOrder =
      searchOption.sort === sort && searchOption.order === 'ASC'
        ? 'DESC'
        : 'ASC';

    navigate({
      search: (prev) => ({
        ...prev,
        sort: sort,
        order: nextOrder,
        page: 1,
      }),
    });
  };

  const clickPage = (idx: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: idx,
      }),
    });
  };

  return (
    <div className="mgt-user-wrp">
      <h4>회원 관리</h4>
      <div className="mgt-user-table-wrp">
        <table className="mgt-user-table">
          <thead></thead>
          <tbody>
            <tr>
              <th id="id" onClick={clickSearchOption('id')}>
                아이디{makeArrow('id')}
              </th>
              <th id="nickname" onClick={clickSearchOption('nickname')}>
                닉네임{makeArrow('nickname')}
              </th>
              <th id="aaa_no" onClick={clickSearchOption('aaa_no')}>
                가입번호{makeArrow('aaa_no')}
              </th>
              <th id="grade" onClick={clickSearchOption('grade')}>
                등급{makeArrow('grade')}
              </th>
              <th id="created_at" onClick={clickSearchOption('created_at')}>
                가입일{makeArrow('created_at')}
              </th>
              <th id="login_at" onClick={clickSearchOption('login_at')}>
                최근로그인{makeArrow('login_at')}
              </th>
            </tr>
            {makeUserList()}
          </tbody>
        </table>
      </div>
      <Paginator
        pageIdx={pageIdx}
        pageNum={Math.ceil(userCount / USER_ROW_NUM)}
        clickPage={clickPage}
      />
    </div>
  );
}

export default UserManagement;
