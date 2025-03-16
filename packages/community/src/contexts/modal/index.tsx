import React, {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useContext } from 'react';

type ModalContextState = {
  modal: ReactElement | null;
  openModal: (modal: ReactElement) => void;
  closeModal: () => void;
};

const ModalContext = React.createContext<ModalContextState | null>(null);

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [modal, setModal] = useState<ReactElement | null>(null);

  useEffect(() => {
    if (modal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [modal]);

  const modalContextValue = useMemo(
    () => ({
      modal,
      openModal: setModal,
      closeModal: () => setModal(null),
    }),
    [modal],
  );

  // TODO: general 하게 사용할 수 있도록 개선
  return (
    <ModalContext.Provider value={modalContextValue}>
      {children}
      {modal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={modalContextValue.closeModal}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {modal}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
};

export const withModal = <T extends NonNullable<unknown>>(
  Component: React.FC<T>,
) => {
  return (props: T) => {
    return (
      <ModalProvider>
        <Component {...props} />
      </ModalProvider>
    );
  };
};
