import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export enum ViewportSize {
  Mobile = 'Mobile',
  Tablet = 'Tablet',
  Desktop = 'Desktop',
}

// should be synced with tailwindcss breakpoints
const MOBILE_WIDTH = 640;
const TABLET_WIDTH = 768;

type ViewportSizeContextState = ViewportSize;

const ViewportSizeContext = createContext<ViewportSizeContextState | null>(
  null,
);

const getWindowViewportSize = (): ViewportSize => {
  const { innerWidth } = window;
  if (innerWidth < MOBILE_WIDTH) {
    return ViewportSize.Mobile;
  } else if (innerWidth < TABLET_WIDTH) {
    return ViewportSize.Tablet;
  } else {
    return ViewportSize.Desktop;
  }
};

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
