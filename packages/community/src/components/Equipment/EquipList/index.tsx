import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import React, { memo, useCallback, useContext, useRef, useState } from 'react';
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
import EquipmentService from 'services/EquipmentService';
import EquipSearchBar from '../EquipSearchBar';
import EquipItem from './EquipItem';

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
  equipmentList: Equipment[];
  canMoveNext: boolean;
  onNext: () => void;
};

const fakeFetch = (delay = 500) => new Promise((res) => setTimeout(res, delay));

const EquipList: React.FC<Props> = ({
  onClickEquipmentEdit, // only for admin
  onClickEquipmentRent,
  onClickEquipmentCart,
  equipmentList,
  canMoveNext,
  onNext,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { openModal } = useModal();

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
      <EquipSearchBar />
      <div className="flex flex-wrap">
        {equipmentList.map((equip) => (
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
        {isLoading && canMoveNext && <SpinningLoader size={40} />}
      </div>
    </>
  );
};

export default memo(EquipList);
