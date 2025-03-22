import { useEffect, useState } from 'react';

export enum DeviceType {
  Mobile = 'Mobile',
  Tablet = 'Tablet',
  Desktop = 'Desktop',
}

const MOBILE_WIDTH = 800;
const TABLET_WIDTH = 1024;

export default function useDeviceType() {
  const [deviceType, setDeviceType] = useState<DeviceType>();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < MOBILE_WIDTH) {
        setDeviceType(DeviceType.Mobile);
      } else if (window.innerWidth < TABLET_WIDTH) {
        setDeviceType(DeviceType.Tablet);
      } else {
        setDeviceType(DeviceType.Desktop);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}
