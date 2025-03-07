import BoardName from 'components/Board/BoardName';
import { useFetch } from 'hooks/useFetch';
import { FC, useCallback } from 'react';
import Image from '../Common/AaaImage';
import { Link } from 'react-router-dom';
import EquipmentService from 'services/EquipmentService';
import { useModal, withModal } from 'contexts/modal';
import RentReturn from './Modal/RentReturn';
import { useAuth } from 'contexts/auth';
import useWindowDimensions from './contexts';

//const EQUIP_RENT_GRADE = 7;
const EQUIP_ADMIN_GRADE = 6;

const Main: FC = () => {
  const fetchFunction = useCallback(() => {
    return EquipmentService.retrieveMyRentList();
  }, []);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const { openModal } = useModal();
  const { width } = useWindowDimensions();

  const authContext = useAuth();

  const getTimeLeft = (end_date: string) => {
    const now = new Date();
    const end = new Date(end_date);
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return '대여 기간 초과';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m 남음`;
  };

  return (
    <div className="board-wrapper">
      <BoardName board_id={undefined} board_name={'장비 대여'} />
      {authContext.authInfo.user.grade <= EQUIP_ADMIN_GRADE && (
        <div className="text-right">
          <Link to="/equipment/admin" className="w-fit mr-4 text-gray-600">
            장비 관리 &gt;&gt;
          </Link>
        </div>
      )}
      <h3 className="mt-4 text-base font-bold">나의 대여 장비 목록</h3>
      <div className="flex flex-wrap">
        {data?.map((rent) => (
          <div className={`w-1/${width < 500 ? 2 : 3} h-24 p-2`} key={rent.id}>
            <div className="h-full flex w-full relative border-2 border-gray-250">
              <div className="w-2/5 h-full">
                <Image
                  imgSrc={rent.equipment.img_path}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="flex flex-col-reverse ml-1">
                <div className="font-bold text-red-400 text-xs py-1">
                  {getTimeLeft(rent.end_date)}
                </div>
                <div className="font-bold py-1">{rent.equipment.name}</div>
              </div>
              <div className="z-1 absolute top-0 right-0 bg-red-400 text-white text-xs font-bold px-1">
                <button
                  onClick={() =>
                    openModal(<RentReturn rent={rent} onSubmit={refresh} />)
                  }
                >
                  <i className="ri-arrow-go-back-line text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Link to="/equipment/rent">
          <button
            className="mt-4 px-10 py-3 bg-[#49A1AF] text-white text-base"
            type="button"
          >
            장비 대여하기
          </button>
        </Link>
      </div>
      <ul className="text-[#A3A3A3] text-sm list-disc mt-4">
        <li>장비 대여는 사용 당일 신청을 윈칙으로 합니다.</li>
        <li>
          대여가 승인된 시각을 기준으로 최대 48시간 이내에 반납해야 합니다.
        </li>
        <li>인당 최대 8개의 장비를 대여할 수 있습니다.</li>
      </ul>
    </div>
  );
};

export default withModal(Main);
