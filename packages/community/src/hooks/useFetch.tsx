import { useState, useEffect, useCallback, useRef } from 'react';

type Props<T> = {
  fetch: () => Promise<T>;
};

export const useFetch = <T,>({ fetch }: Props<T>) => {
  const [data, setData] = useState<T>();
  const isUnmounted = useRef(false);

  useEffect(() => {
    isUnmounted.current = false;
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch().then((data) => {
      if (!ignore) {
        setData(data);
      }
    });
    return () => {
      ignore = true;
    };
  }, [fetch]);

  const refresh = useCallback(async () => {
    // console.log('refresh');
    const refreshedData = await fetch();
    // NOTE: fetch 중 component가 unmount된 경우에는 무시
    if (isUnmounted.current) {
      return;
    }
    setData(refreshedData);
  }, [fetch]);

  return {
    data,
    refresh,
  };
};
