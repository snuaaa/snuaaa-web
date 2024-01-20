import ReactDOM from 'react-dom';

const FullScreenPortal = ({ children }) => {
  const portalElement = document.getElementById('full-screen-root');

  return ReactDOM.createPortal(children, portalElement);
};

export default FullScreenPortal;