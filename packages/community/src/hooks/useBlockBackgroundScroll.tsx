import { useEffect } from 'react';

function useBlockBackgroundScroll() {

  useEffect(() => {
    document.body.classList.add('enif-overflow-hidden');
    return function() {
      document.body.classList.remove('enif-overflow-hidden');
    };
  }, []);
}

export default useBlockBackgroundScroll;
