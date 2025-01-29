import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Equipment } from 'services/types';
import Image from '../../components/Common/AaaImage';
import EquipmentStatusEnum from 'common/EquipmentStatusEnum';
import EquipmentRentEnum from 'common/EquipmentRentEnum';
import { convertDateMMDD } from 'utils/convertDate';
import SpinningLoader from 'components/Common/SpinningLoader';

const LIMIT_UNIT = 12;

type EquipListProps = {
  equipments: Equipment[];
  searchInfo: {
    category_id: number;
    status: string;
    keyword: string;
  };
  isAdmin: boolean;
};

const fakeFetch = (delay = 500) => new Promise((res) => setTimeout(res, delay));

const EquipList: React.FC<EquipListProps> = ({
  equipments,
  searchInfo,
  isAdmin,
}) => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const target = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState<number>(LIMIT_UNIT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setLimit(LIMIT_UNIT);
  }, [searchInfo]);

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

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect);
    if (target.current) {
      observer.observe(target.current);
    }
    return () => observer.disconnect();
  }, [onIntersect]);

  const increaseLimit = () => {
    setLimit((prevLimit) => prevLimit + LIMIT_UNIT);
  };

  const makeEquipList = (equips: Equipment[]) => {
    if (equips.length > 0 && equipmentCategories) {
      return equips
        .filter((equip) => {
          if (
            searchInfo.category_id !== 0 &&
            equip.category_id !== searchInfo.category_id
          )
            return false;
          if (searchInfo.status !== '' && equip.status !== searchInfo.status)
            return false;
          if (
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
                    <i className="ri-pencil-line text-2xl"></i>
                  </div>
                  <div className="text-base font-bold mt-2 mr-3">
                    {equip.name}
                  </div>
                  <div className="equip-picture">
                    <Image imgSrc={equip.img_path} />
                  </div>
                  <div className="h-100 my-2">
                    <div className="font-bold mr-3 inline-block">분류</div>
                    <div className="equip-info-content inline-block">
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
                      className={
                        'equip-info-content inline-block ' +
                        (equip.status === EquipmentStatusEnum.OK
                          ? 'text-green-600'
                          : equip.status === EquipmentStatusEnum.BROKEN
                            ? 'text-red-600'
                            : equip.status === EquipmentStatusEnum.REPAIRING
                              ? 'text-yellow-600'
                              : 'text-gray-600')
                      }
                    >
                      {equip.status === EquipmentStatusEnum.OK
                        ? '양호'
                        : equip.status === EquipmentStatusEnum.BROKEN
                          ? '수리 필요'
                          : equip.status === EquipmentStatusEnum.REPAIRING
                            ? '수리 중'
                            : equip.status === EquipmentStatusEnum.LOST
                              ? '분실'
                              : equip.status === EquipmentStatusEnum.ETC
                                ? '기타'
                                : '기타'}
                    </div>
                  </div>
                  <div className="my-2">
                    <div className="font-bold mr-3 inline-block">위치</div>
                    <div className="equip-info-content inline-block">
                      {equip.location}
                    </div>
                  </div>
                  {isAdmin ? (
                    <div
                      className={
                        'w-xs text-white text-center font-bold py-2 mx-2 my-4 ' +
                        (equip.rent_status === EquipmentRentEnum.RENTABLE
                          ? 'bg-cyan-600'
                          : equip.rent_status === EquipmentRentEnum.RENTED
                            ? 'bg-red-600'
                            : 'bg-yellow-600')
                      }
                    >
                      {equip.rent_status === EquipmentRentEnum.RENTABLE
                        ? '대여 가능'
                        : equip.rent_status === EquipmentRentEnum.UNRENTABLE
                          ? '대여 불가'
                          : equip.rent_status === EquipmentRentEnum.RENTED
                            ? equip.renter?.nickname +
                              ' ~' +
                              // parse date to MM/DD format
                              convertDateMMDD(equip.end_date)
                            : ''}
                    </div>
                  ) : (
                    <div className="equip-rent-wrapper">
                      <div className="equip-rent-status">
                        {equip.rent_status === EquipmentRentEnum.RENTABLE
                          ? '바로 대여'
                          : equip.rent_status === EquipmentRentEnum.UNRENTABLE
                            ? '대여 불가'
                            : equip.rent_status === EquipmentRentEnum.RENTED
                              ? equip.renter?.nickname +
                                ' ~' +
                                // parse date to MM/DD format
                                convertDateMMDD(equip.end_date)
                              : ''}
                      </div>
                      <div className="equip-cart-button">
                        {equip.rent_status === EquipmentRentEnum.RENTABLE
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
    // TODO: reused photo list loader, but may need to customize
    <>
      <div className="flex flex-wrap">{makeEquipList(equipments)}</div>
      <div className="photo-list-loader-wrapper" ref={target}>
        {isLoading && limit < equipments.length && <SpinningLoader size={40} />}
      </div>
    </>
  );
};

export default memo(EquipList);
