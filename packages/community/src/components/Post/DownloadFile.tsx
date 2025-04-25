import { PropsWithChildren } from 'react';
import { SERVER_URL } from '~/constants/env';

type Props = {
  content_id: number;
  file_id: number;
};

const DownloadFile = ({
  content_id,
  file_id,
  children,
}: PropsWithChildren<Props>) => {
  const url = SERVER_URL + `api/content/${content_id}/file/${file_id}`;
  return <a href={url}>{children}</a>;
};

export default DownloadFile;
