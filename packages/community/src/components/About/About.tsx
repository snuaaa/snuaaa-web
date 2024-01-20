import React from 'react';
import { match } from 'react-router';

import AboutAAA from '../../components/About/aboutAAA';
import Contact from '../../components/About/contact';
import Equipment from '../../components/About/equipment';
import Observation from '../../components/About/observation';
import AaaHistory from '../../components/About/AaaHistory';
import Officers from '../../components/About/officers';
import Regulation from '../../components/About/regulation';

type AboutProps = {
    match: match<{ aaa: string }>
}

function About(props: AboutProps) {

  const aboutIdx = props.match.params.aaa;

  if (aboutIdx === 'aboutAAA') return (<AboutAAA />);
  else if (aboutIdx === 'contact') return (<Contact />);
  else if (aboutIdx === 'equipment') return (<Equipment />);
  else if (aboutIdx === 'observation') return (<Observation />);
  else if (aboutIdx === 'history') return (<AaaHistory />);
  else if (aboutIdx === 'officers') return (<Officers />);
  else if (aboutIdx === 'regulation') return (<Regulation />);
  else return (<AboutAAA />);
}

export default About;