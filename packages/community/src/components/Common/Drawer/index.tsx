import { PropsWithChildren, useEffect, useMemo } from 'react';
import { drawerContext, DrawerContext } from './context';

const Drawer = ({
  isOpen,
  onClose,
  children,
}: PropsWithChildren<DrawerContext>) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    document.body.classList.add('overflow-hidden');
    return function () {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  const contextValue = useMemo(() => ({ isOpen, onClose }), [isOpen, onClose]);

  return (
    <drawerContext.Provider value={contextValue}>
      <div
        className={`fixed inset-0 h-full w-full z-30 ${isOpen ? 'visible' : 'invisible'} transition-all duration-300 ease-out`}
      >
        <div
          className={`bg-slate-800 absolute inset-0 ${isOpen ? 'opacity-50' : 'opacity-0'} transition-all duration-300 ease-out`}
          onClick={onClose}
        ></div>

        <div
          className={`absolute top-0 left-0 ${isOpen ? 'max-w-full' : 'max-w-0'} h-full bg-slate-700 transition-all duration-300 ease-out z-10 overflow-auto`}
        >
          {children}
        </div>
      </div>
    </drawerContext.Provider>
  );
};

export default Drawer;
