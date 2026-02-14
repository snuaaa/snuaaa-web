import { useLocation } from '@tanstack/react-router';
import { useMemo } from 'react';

function useQueryString() {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return params;
  }, [search]);
}

export default useQueryString;
