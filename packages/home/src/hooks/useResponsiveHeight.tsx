import { useEffect, useState } from 'react';

const useResponsiveHeight = () => {
  const [responsiveHeight, setResponsiveHeight] = useState<number>(0);

  useEffect(() => {
    setResponsiveHeight(window.innerHeight);
    const onResize = () => {
      setResponsiveHeight(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return { responsiveHeight };
};

export default useResponsiveHeight;
