import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Equipment,
  EquipmentRentStatus,
  EquipmentStatus,
} from 'services/types';
import { convertDateMMDD } from 'utils/convertDate';
import SpinningLoader from 'components/Common/SpinningLoader';
import RentRecords from '../Modal/RentRecords';
import { JSX } from 'react/jsx-runtime';
import { useModal } from 'contexts/modal';
import EquipmentService, {
  RetrieveEquipmentListResponse,
} from 'services/EquipmentService';
import EquipSearchBar, { EquipSearchLocationState } from '../EquipSearchBar';
import EquipItem from './EquipItem';
import { useLocation } from 'react-router';

const equipmentRentColorMap: Record<EquipmentRentStatus, string> = {
  [EquipmentRentStatus.RENTABLE]: 'bg-cyan-500',
  [EquipmentRentStatus.UNRENTABLE]: 'bg-yellow-400',
  [EquipmentRentStatus.RENTED]: 'bg-red-400',
};

const mapEquipmentRentText = (equip: Equipment) => {
  return equip.rent_status === EquipmentRentStatus.RENTABLE
    ? '대여 가능'
    : equip.rent_status === EquipmentRentStatus.UNRENTABLE
      ? '대여 불가'
      : `${equip.renter?.nickname} ~ ${convertDateMMDD(equip.end_date)}`;
};

type Props = {
  onClickEquipmentEdit?: (equip: Equipment) => void;
  onClickEquipmentRent?: (equip: Equipment) => void;
  onClickEquipmentCart?: (equip: Equipment) => void;
  data: RetrieveEquipmentListResponse;
};

const fakeFetch = (delay = 500) => new Promise((res) => setTimeout(res, delay));

const LIMIT_UNIT = 12;

const EquipList: React.FC<Props> = ({
  onClickEquipmentEdit, // only for admin
  onClickEquipmentRent,
  onClickEquipmentCart,
  data,
}) => {
  const location = useLocation<EquipSearchLocationState>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { openModal } = useModal();

  //const equipCount = data?.equipCount ?? 0;

  const [limit, setLimit] = useState<number>(LIMIT_UNIT);

  const filteredEquipments = useMemo(
    () =>
      (location.state
        ? data?.equipInfo
            .filter((equip) => {
              if (
                location.state.category_id &&
                location.state.category_id !== 0 &&
                equip.category_id !== location.state?.category_id
              )
                return false;
              if (
                location.state.status !== '' &&
                equip.status !== location.state.status
              )
                return false;
              if (
                location.state.rent_status !== '' &&
                equip.rent_status !== location.state.rent_status
              )
                return false;
              if (
                location.state.keyword !== '' &&
                !equip.name
                  .toLowerCase()
                  .includes(location.state.keyword.toLowerCase()) &&
                !equip.nickname
                  .toLowerCase()
                  .includes(location.state.keyword.toLowerCase())
              )
                return false;
              if (
                location.state.maker !== '' &&
                !equip.maker
                  .toLowerCase()
                  .includes(location.state.maker.toLowerCase())
              )
                return false;
              return true;
            })
            ?.sort(
              (a, b) =>
                (location.state.sort_by === 'category_id'
                  ? a[location.state.sort_by] - b[location.state.sort_by]
                  : a[location.state.sort_by].localeCompare(
                      b[location.state.sort_by],
                    )) * (location.state.sort_order === 'ASC' ? 1 : -1),
            )
        : data?.equipInfo
      )?.slice(0, limit) ?? [],
    [data?.equipInfo, limit, location.state],
  );

  useEffect(() => {
    setLimit(LIMIT_UNIT);
  }, [location.state]);

  const increaseLimit = () => {
    setLimit((prevLimit) => prevLimit + LIMIT_UNIT);
  };

  const onIntersect = useCallback(
    async (
      [entry]: IntersectionObserverEntry[],
      observer: IntersectionObserver,
    ) => {
      if (entry.isIntersecting) {
        setIsLoading(true);
        await fakeFetch();
        increaseLimit();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    },
    [],
  );

  const cleanupCallback = useRef(() => {
    /*left empty on purpose*/
  });

  const loaderRef = useCallback(
    (e: HTMLDivElement | null) => {
      if (e) {
        const observer = new IntersectionObserver(onIntersect);
        observer.observe(e);
        cleanupCallback.current = () => observer.disconnect();
      } else cleanupCallback.current();
    },
    [onIntersect],
  );

  return (
    <>
      <EquipSearchBar />
      <div className="flex flex-wrap">
        {filteredEquipments.map((equip) => (
          <EquipItem equip={equip}>
            {onClickEquipmentEdit && (
              <>
                <div className="z-1 absolute top-0 right-0">
                  <button onClick={() => onClickEquipmentEdit(equip)}>
                    <i className="ri-pencil-line text-2xl"></i>
                  </button>
                  <button
                    onClick={() => openModal(<RentRecords id={equip.id} />)}
                  >
                    <i className="ri-file-list-2-line text-2xl"></i>
                  </button>
                  {/*
                  <button
                    onClick={() => EquipmentService.deleteEquipment(equip.id)}
                  >
                    <i className="ri-delete-bin-line text-2xl"></i>
                  </button>
                  */}
                </div>
                <div
                  className={`w-xs text-white text-center font-bold py-2 mx-2 my-4 ${equipmentRentColorMap[equip.rent_status]}`}
                >
                  {mapEquipmentRentText(equip)}
                </div>
              </>
            )}
            <div>
              {onClickEquipmentRent && (
                <button
                  onClick={() => onClickEquipmentRent(equip)}
                  disabled={equip.rent_status !== EquipmentRentStatus.RENTABLE}
                  className={
                    'w-3/5 text-center font-bold py-2 ml-2 my-4 float-left ' +
                    (equip.rent_status === EquipmentRentStatus.RENTABLE
                      ? 'text-cyan-600 border border-cyan-600'
                      : 'text-black bg-gray-200')
                  }
                >
                  {mapEquipmentRentText(equip)}
                </button>
              )}
              {onClickEquipmentCart && (
                <button
                  onClick={() => onClickEquipmentCart(equip)}
                  disabled={equip.rent_status !== EquipmentRentStatus.RENTABLE}
                  className={
                    'text-center w-1/5 font-bold py-2 mr-2 my-4 float-right ' +
                    (equip.rent_status === EquipmentRentStatus.RENTABLE
                      ? 'text-cyan-600 border border-cyan-600'
                      : 'text-black bg-gray-200')
                  }
                >
                  {equip.rent_status === EquipmentRentStatus.RENTABLE
                    ? '+'
                    : '-'}
                </button>
              )}
            </div>
          </EquipItem>
        ))}
      </div>
      <div className="w-full flex justify-center" ref={loaderRef}>
        {isLoading && data.equipInfo.length < limit && (
          <SpinningLoader size={40} />
        )}
      </div>
    </>
  );
};

export default memo(EquipList);
