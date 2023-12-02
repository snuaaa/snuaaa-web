import React from 'react';

const DownloadFile = ({content_id, file_id, children}) => {

  let url = process.env.REACT_APP_SERVER_URL + `api/content/${content_id}/file/${file_id}`;
  return (
    <a href={url}>{children}</a>
  );
};

export default DownloadFile;