import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import SpinningLoader from 'components/Common/SpinningLoader';
import EquipmentService from 'services/EquipmentService';
import { useFetch } from 'hooks/useFetch';
import Loading from 'components/Common/Loading';
import ItemModelProvider from './ItemModelProvider';
import RentModelProvider from './RentModelProvider';
import { SearchInfo } from 'services/types';
import SearchFilter, { LocationState } from './SearchFilter';
import { useLocation } from 'react-router-dom';

const LIMIT_UNIT = 12;

const fakeFetch = (delay = 500) => new Promise((res) => setTimeout(res, delay));

const EquipList: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [limit, setLimit] = useState<number>(LIMIT_UNIT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const location = useLocation<LocationState>();
  const [searchInfo, setSearchInfo] = useState<SearchInfo | undefined>(
    undefined,
  );

  const fetchFunction = useCallback(async () => {
    return EquipmentService.retrieveList(1);
  }, []);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const equipCount = data?.equipCount ?? 0;
  const equipments = data?.equipInfo ?? [];

  useEffect(() => {
    setLimit(LIMIT_UNIT);
  }, [searchInfo]);

  useEffect(() => {
    if (location.state) {
      setSearchInfo(location.state.searchInfo);
    } else {
      setSearchInfo({
        category_id: 0,
        status: '',
        keyword: '',
      });
    }
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

  const ModelProvider = isAdmin ? ItemModelProvider : RentModelProvider;

  if (!data) {
    return <Loading />;
  }

  return (
    // TODO: reused photo list loader, but may need to customize
    <div className="equip-list-wrapper">
      <SearchFilter />
      <ModelProvider
        equips={equipments}
        searchInfo={searchInfo}
        limit={limit}
        confirm={refresh}
      />

      <div className="equip-list-loader-wrapper" ref={refCallback}>
        {isLoading && limit < equipments.length && <SpinningLoader size={40} />}
      </div>
    </div>
  );
};

export default memo(EquipList);
