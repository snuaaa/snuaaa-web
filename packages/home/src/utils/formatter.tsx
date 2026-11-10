import { Fragment } from 'react';

export const nl2br = (text: string) =>
  text.split('\n').map((t) => (
    <Fragment key={t}>
      {t}
      <br />
    </Fragment>
  ));
