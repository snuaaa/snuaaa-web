import React from 'react';
import RiseSetType from '../types/RiseSetType';

const defaultRiseSet: RiseSetType = {
  aste: 0,
  astm: 0,
  lunAge: 0,
  moonrise: 0,
  moonset: 0,
  sunrise: 0,
  sunset: 0
};

const RiseSetContext = React.createContext(defaultRiseSet);

export default RiseSetContext;