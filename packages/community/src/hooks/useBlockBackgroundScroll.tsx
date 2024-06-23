import { useEffect } from 'react';

function useBlockBackgroundScroll() {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return function () {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);
}

export default useBlockBackgroundScroll;
