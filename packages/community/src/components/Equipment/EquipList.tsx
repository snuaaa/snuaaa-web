import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Equipment,
  EquipmentRentStatus,
  EquipmentStatus,
} from 'services/types';
import Image from '../../components/Common/AaaImage';
import { convertDateMMDD } from 'utils/convertDate';
import SpinningLoader from 'components/Common/SpinningLoader';
import { EditModalInfo } from './EquipmentEdit';
import EquipmentService from 'services/EquipmentService';
import { useFetch } from 'hooks/useFetch';
import Loading from 'components/Common/Loading';

const LIMIT_UNIT = 12;

const equipmentStatusColorMap: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OK]: 'text-green-600',
  [EquipmentStatus.BROKEN]: 'text-red-600',
  [EquipmentStatus.REPAIRING]: 'text-yellow-600',
  [EquipmentStatus.LOST]: 'text-gray-500',
  [EquipmentStatus.ETC]: 'text-gray-500',
};

const equipmentStatusTextMap: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OK]: '양호',
  [EquipmentStatus.BROKEN]: '수리 필요',
  [EquipmentStatus.REPAIRING]: '수리 중',
  [EquipmentStatus.LOST]: '분실',
  [EquipmentStatus.ETC]: '기타',
};

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

type EquipListProps = {
  setEditModalInfo: React.Dispatch<React.SetStateAction<EditModalInfo>>;
  searchInfo:
    | {
        category_id: number;
        status: string;
        keyword: string;
      }
    | undefined;
  isAdmin: boolean;
  refreshFlag?: boolean;
};

const fakeFetch = (delay = 500) => new Promise((res) => setTimeout(res, delay));

const EquipList: React.FC<EquipListProps> = ({
  setEditModalInfo, // only for admin
  searchInfo,
  isAdmin,
  refreshFlag = undefined,
}) => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const [limit, setLimit] = useState<number>(LIMIT_UNIT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFunction = useCallback(async () => {
    return EquipmentService.retrieveList(1);
  }, []);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  useEffect(() => {
    refresh();
  }, [refresh, refreshFlag]);

  //const equipCount = data?.equipCount ?? 0;
  const equipments = data?.equipInfo ?? [];

  useEffect(() => {
    setLimit(LIMIT_UNIT);
  }, [searchInfo]);

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

  const refCallback = useCallback(
    (e: HTMLDivElement | null) => {
      if (e) {
        const observer = new IntersectionObserver(onIntersect);
        observer.observe(e);
        cleanupCallback.current = () => observer.disconnect();
      } else cleanupCallback.current();
    },
    [onIntersect],
  );

  if (!data) {
    return <Loading />;
  }

  const makeEquipList = (equips: Equipment[]) => {
    if (equips.length > 0 && equipmentCategories) {
      return equips
        .filter((equip) => {
          if (
            searchInfo &&
            searchInfo.category_id !== 0 &&
            equip.category_id !== searchInfo.category_id
          )
            return false;
          if (
            searchInfo &&
            searchInfo.status !== '' &&
            equip.status !== searchInfo.status
          )
            return false;
          if (
            searchInfo &&
            searchInfo.keyword !== '' &&
            !equip.name.toLowerCase().includes(searchInfo.keyword.toLowerCase())
          )
            return false;
          return true;
        })
        .map((equip, index) => {
          if (index < limit) {
            return (
              <div className="w-1/3 h-72 flex flex-col" key={equip.id}>
                <div className="relative flex-grow border-2 border-gray-250 mx-2 my-2 px-3">
                  <div className="z-1 absolute top-0 right-0">
                    <button
                      className=""
                      onClick={() => {
                        setEditModalInfo({
                          isModalOpen: true,
                          equipment: equip,
                        });
                      }}
                    >
                      <i className="ri-pencil-line text-2xl"></i>
                    </button>
                  </div>
                  <div className="text-base font-bold mt-2 mr-3">
                    {equip.name}
                  </div>
                  <div className="equip-picture">
                    <Image imgSrc={equip.img_path} />
                  </div>
                  <div className="h-100 my-2">
                    <div className="font-bold mr-3 inline-block">분류</div>
                    <div className="inline-block">
                      {
                        equipmentCategories.find(
                          (category) => category.id === equip.category_id,
                        )?.name
                      }
                    </div>
                  </div>
                  <div className="my-2">
                    <div className="font-bold mr-3 inline-block">상태</div>
                    <div
                      className={`inline-block ${equipmentStatusColorMap[equip.status]}`}
                    >
                      {equipmentStatusTextMap[equip.status]}
                    </div>
                  </div>
                  <div className="my-2">
                    <div className="font-bold mr-3 inline-block">위치</div>
                    <div className="inline-block">{equip.location}</div>
                  </div>
                  {isAdmin ? (
                    <div
                      className={`w-xs text-white text-center font-bold py-2 mx-2 my-4 ${equipmentRentColorMap[equip.rent_status]}`}
                    >
                      {mapEquipmentRentText(equip)}
                    </div>
                  ) : (
                    <div className="equip-rent-wrapper">
                      <div
                        className={
                          'w-3/5 text-center font-bold py-2 ml-2 my-4 float-left ' +
                          (equip.rent_status === EquipmentRentStatus.RENTABLE
                            ? 'text-cyan-600 border border-cyan-600'
                            : 'text-black bg-gray-200')
                        }
                      >
                        {mapEquipmentRentText(equip)}
                      </div>
                      <div
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return null;
        });
    }
    return null;
  };

  return (
    <>
      <div className="flex flex-wrap">{makeEquipList(equipments)}</div>
      <div className="equip-list-loader-wrapper" ref={refCallback}>
        {isLoading && limit < equipments.length && <SpinningLoader size={40} />}
      </div>
    </>
  );
};

export default memo(EquipList);
