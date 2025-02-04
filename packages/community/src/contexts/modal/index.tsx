import React, {
  PropsWithChildren,
  ReactElement,
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
      {modal}
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
