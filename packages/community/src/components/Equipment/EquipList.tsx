import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import React, { memo, useCallback, useContext, useRef, useState } from 'react';
import {
  Equipment,
  EquipmentRentStatus,
  EquipmentStatus,
} from 'services/types';
import Image from '../../components/Common/AaaImage';
import { convertDateMMDD } from 'utils/convertDate';
import SpinningLoader from 'components/Common/SpinningLoader';

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

type Props = {
  onClickEquipmentEdit?: (equip: Equipment) => void;
  equipmentList: Equipment[];
  canMoveNext: boolean;
  onNext: () => void;
};

const fakeFetch = (delay = 500) => new Promise((res) => setTimeout(res, delay));

const EquipList: React.FC<Props> = ({
  onClickEquipmentEdit, // only for admin
  equipmentList,
  canMoveNext,
  onNext,
}) => {
  const { categories } = useContext(EquipmentCategoryContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //const equipCount = data?.equipCount ?? 0;

  const onIntersect = useCallback(
    async (
      [entry]: IntersectionObserverEntry[],
      observer: IntersectionObserver,
    ) => {
      if (entry.isIntersecting) {
        setIsLoading(true);
        await fakeFetch();
        onNext();
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
      <div className="flex flex-wrap">
        {equipmentList.map((equip) => (
          <div className="w-1/3 h-72 flex flex-col" key={equip.id}>
            <div className="relative flex-grow border-2 border-gray-250 mx-2 my-2 px-3">
              {onClickEquipmentEdit && (
                <div className="z-1 absolute top-0 right-0">
                  <button onClick={() => onClickEquipmentEdit(equip)}>
                    <i className="ri-pencil-line text-2xl"></i>
                  </button>
                </div>
              )}
              <div className="text-base font-bold mt-2 mr-3">{equip.name}</div>
              <div className="equip-picture">
                <Image imgSrc={equip.img_path} />
              </div>
              <div className="h-100 my-2">
                <div className="font-bold mr-3 inline-block">분류</div>
                <div className="inline-block">
                  {
                    categories.find(
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
              {onClickEquipmentEdit ? (
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
        ))}
      </div>
      <div className="equip-list-loader-wrapper" ref={loaderRef}>
        {isLoading && canMoveNext && <SpinningLoader size={40} />}
      </div>
    </>
  );
};

export default memo(EquipList);
