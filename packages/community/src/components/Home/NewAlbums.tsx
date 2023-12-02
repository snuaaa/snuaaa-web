import React from 'react';
import { Link } from 'react-router-dom';
import defaultAlbumCover from 'assets/img/default_photo_img.png';
import Image from '../Common/AaaImage';
import AlbumType from '../../types/AlbumType';

type NewAlbumsProps = {
    title: string;
    board_id: string;
    albums: AlbumType[];
}

function NewAlbums({ title, board_id, albums }: NewAlbumsProps) {

  const makeAlbumList = () => {
    if (albums) {
      return albums.map(content => {
        let thumbnailPath = '';
        if (content.album.thumbnail && content.album.thumbnail.photo) {
          thumbnailPath = content.album.thumbnail.photo.thumbnail_path;
        }
        else if (content.children && content.children[0]) {
          thumbnailPath = content.children[0].photo.thumbnail_path;
        }
        else {
          thumbnailPath = '';
        }
        return (
          <div className="new-album-list" key={content.content_id}>
            <Link to={{
              pathname: `/album/${content.content_id}`
            }}>
              <Image imgSrc={thumbnailPath} defaultImgSrc={defaultAlbumCover} />
              <div className="album-cover">
                <h5>
                  {content.title}
                </h5>
              </div>
            </Link>
          </div>
        );
      });
    }
  };

  return (
    <div className="new-albums-wrapper">
      <Link to={`/board/${board_id}`}>
        <h4>{title}</h4>
      </Link>
      <div className="new-album-list-wrapper">
        {makeAlbumList()}
      </div>
    </div>
  );
}

export default NewAlbums;
