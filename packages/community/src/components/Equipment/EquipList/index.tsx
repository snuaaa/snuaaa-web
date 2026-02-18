import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import SpinningLoader from '~/components/Common/SpinningLoader';
import {
  EquipSearchLocationState,
  SortBy,
} from '~/components/Equipment/common';
import { RetrieveEquipmentListResponse } from '~/services/EquipmentService';
import { Equipment } from '~/services/types';
import EquipmentItem from './EquipmentItem';

type Props = {
  type: 'rent' | 'admin';
  data: RetrieveEquipmentListResponse;
  columns: 1 | 2 | 3;
  search: EquipSearchLocationState;
};

const gridColumnsStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

const fakeFetch = (delay = 500) => new Promise((res) => setTimeout(res, delay));

const LIMIT_UNIT = 12;

const EquipList: React.FC<Props> = ({ data, columns, type, search }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ...

  const [limit, setLimit] = useState<number>(LIMIT_UNIT);

  const sortCompareFunction = (
    equipA: Equipment,
    equipB: Equipment,
    sortBy: SortBy,
    sortOrder: 'ASC' | 'DESC',
  ) => {
    const order = sortOrder === 'ASC' ? 1 : -1;
    if (sortBy === SortBy.CATEGORY) {
      return (equipA.category_id - equipB.category_id) * order;
    }
    return equipA[sortBy].localeCompare(equipB[sortBy]) * order;
  };

  const [filteredEquipments, equipCount] = useMemo(() => {
    // using search params instead of location.state
    const filtered = search
      ? data?.equipInfo
          .filter((equip) => {
            if (
              search.category_id &&
              search.category_id !== 0 &&
              equip.category_id !== search.category_id
            )
              return false;
            // ... keyword, maker, status, rent_status checks using search object
            if (
              search.status !== '' &&
              search.status !== undefined &&
              equip.status !== search.status
            )
              return false;
            if (
              search.rent_status !== '' &&
              search.rent_status !== undefined &&
              equip.rent_status !== search.rent_status
            )
              return false;
            if (
              search.keyword &&
              search.keyword !== '' &&
              !equip.name
                .toLowerCase()
                .includes(search.keyword.toLowerCase()) &&
              !equip.nickname
                .toLowerCase()
                .includes(search.keyword.toLowerCase())
            )
              return false;
            if (
              search.maker &&
              search.maker !== '' &&
              !equip.maker.toLowerCase().includes(search.maker.toLowerCase())
            )
              return false;
            return true;
          })
          ?.sort((a, b) =>
            sortCompareFunction(
              a,
              b,
              search.sort_by ?? SortBy.CREATED_AT,
              search.sort_order ?? 'DESC',
            ),
          )
      : data?.equipInfo;
    return [filtered?.slice(0, limit) ?? [], filtered?.length ?? 0];
  }, [data?.equipInfo, limit, search]);

  useEffect(() => {
    setLimit(LIMIT_UNIT);
  }, [search]);

  const increaseLimit = () => {
    setLimit((prevLimit) => prevLimit + LIMIT_UNIT);
  };

  const onIntersect = useCallback(
    async (
      [entry]: IntersectionObserverEntry[],
      // observer: IntersectionObserver,
    ) => {
      if (entry.isIntersecting && limit < equipCount) {
        setIsLoading(true);
        await fakeFetch();
        increaseLimit();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    },
    [limit, equipCount],
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
      <div className={`grid ${gridColumnsStyles[columns]} gap-4 px-2`}>
        {filteredEquipments.map((equip) => (
          <EquipmentItem
            equip={equip}
            key={equip.id}
            type={type}
          ></EquipmentItem>
        ))}
      </div>
      <div className="w-full flex justify-center" ref={loaderRef}>
        {isLoading && <SpinningLoader size={40} />}
      </div>
    </>
  );
};

export default memo(EquipList);
