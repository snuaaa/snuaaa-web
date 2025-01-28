import BoardName from 'components/Board/BoardName';
import { useFetch } from 'hooks/useFetch';
import { FC, useCallback } from 'react';
import { Link } from 'react-router-dom';
import EquipmentService from 'services/EquipmentService';

const Main: FC = () => {
  const fetchFunction = useCallback(() => {
    return EquipmentService.retrieveMyRentList();
  }, []);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  return (
    <div className="board-wrapper">
      <BoardName board_id={undefined} board_name={'장비 대여'} />
      <h3 className="mt-4 text-base font-bold">나의 대여 장비 목록</h3>
      <div className="flex justify-center">
        <Link to="/equipment/rent">
          <button
            className="mt-4 px-10 py-3 bg-[#49A1AF] text-white text-base"
            type="button"
          >
            장비 대여 신청
          </button>
        </Link>
      </div>
      <ul className="text-[#A3A3A3] text-sm list-disc mt-4">
        <li>장비 대여는 사용 당일 신청을 윈칙으로 합니다.</li>
        <li>
          대여가 승인된 시각을 기준으로 최대 48시간 이내에 반납해야합니다.
        </li>
        <li>인 당 최대 8개의 장비를 대여할 수 있습니다.</li>
      </ul>
    </div>
  );
};

export default Main;
