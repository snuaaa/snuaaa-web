import React from 'react';
import { RiseSet } from 'services/HomeService';

const defaultRiseSet: RiseSet = {
  aste: 0,
  astm: 0,
  lunAge: 0,
  moonrise: 0,
  moonset: 0,
  sunrise: 0,
  sunset: 0,
};

const RiseSetContext = React.createContext(defaultRiseSet);

export default RiseSetContext;
