import { PropsWithChildren } from 'react';

type Props = {
  content_id: number;
  file_id: number;
};

const DownloadFile = ({
  content_id,
  file_id,
  children,
}: PropsWithChildren<Props>) => {
  const url =
    process.env.REACT_APP_SERVER_URL +
    `api/content/${content_id}/file/${file_id}`;
  return <a href={url}>{children}</a>;
};

export default DownloadFile;
