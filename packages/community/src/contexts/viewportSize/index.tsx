import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type ViewportSizeContextState = {
  width: number;
  height: number;
};

const ViewportSizeContext = createContext<ViewportSizeContextState | null>(
  null,
);

function getWindowViewportSize() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export const ViewportSizeProvider = ({ children }: PropsWithChildren) => {
  const [windowViewportSize, setWindowViewportSize] = useState(
    getWindowViewportSize(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowViewportSize(getWindowViewportSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ViewportSizeContext.Provider value={windowViewportSize}>
      {children}
    </ViewportSizeContext.Provider>
  );
};

export const withViewportSize = <T extends NonNullable<unknown>>(
  Component: React.FC<T>,
) => {
  return (props: T) => {
    return (
      <ViewportSizeProvider>
        <Component {...props} />
      </ViewportSizeProvider>
    );
  };
};

export const useViewportSize = () => {
  const context = useContext(ViewportSizeContext);

  if (!context) {
    throw new Error(
      'useViewportSize must be used within a ViewportSizeProvider',
    );
  }

  return context;
};
