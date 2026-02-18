import { PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';

const FullScreenPortal = ({ children }: PropsWithChildren) => {
  const portalElement = document.getElementById('full-screen-root');

  if (!portalElement) {
    throw new Error(
      'Cannot find portal target element. Check portal element id',
    );
  }

  return ReactDOM.createPortal(children, portalElement);
};

export default FullScreenPortal;
