import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import SpinningLoader from 'components/Common/SpinningLoader';
import { EquipSearchLocationState, SortBy } from '../EquipSearchBar';
import { RetrieveEquipmentListResponse } from 'services/EquipmentService';
import EquipItem from './EquipItem';
import { useLocation } from 'react-router';
import { Equipment } from 'services/types';

type Props = {
  type: 'rent' | 'admin';
  data: RetrieveEquipmentListResponse;
  columns: number;
};

const fakeFetch = (delay = 500) => new Promise((res) => setTimeout(res, delay));

const LIMIT_UNIT = 12;

const EquipList: React.FC<Props> = ({ data, columns, type }) => {
  const location = useLocation<EquipSearchLocationState>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //const equipCount = data?.equipCount ?? 0;

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
            ?.sort((a, b) =>
              sortCompareFunction(
                a,
                b,
                location.state.sort_by,
                location.state.sort_order,
              ),
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
      <div className="flex flex-wrap">
        {filteredEquipments.map((equip) => (
          <EquipItem
            equip={equip}
            columns={columns}
            key={equip.id}
            type={type}
          ></EquipItem>
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
