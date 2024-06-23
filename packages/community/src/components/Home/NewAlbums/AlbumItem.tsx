import { FC } from 'react';
import { Album } from 'services/types';
import { Link } from 'react-router-dom';
import Image from '../../Common/AaaImage';
import defaultAlbumCover from 'assets/img/default_photo_img.png';

type Props = {
  album: Album;
};

const AlbumItem: FC<Props> = ({ album }) => {
  let thumbnailPath = '';
  if (album.album.thumbnail?.photo) {
    thumbnailPath = album.album.thumbnail.photo.thumbnail_path;
  } else if (album.children && album.children[0]) {
    thumbnailPath = album.children[0].photo.thumbnail_path;
  } else {
    thumbnailPath = '';
  }

  return (
    <div className="relative pb-full">
      <Link
        to={{
          pathname: `/album/${album.content_id}`,
        }}
      >
        <Image imgSrc={thumbnailPath} defaultImgSrc={defaultAlbumCover} />
        <div className="absolute top-0 left-0 flex justify-center items-center w-full h-full z-10 bg-[#333333]/[0.1] hover:bg-[#686868]/[0.5] transition-all">
          <h5 className="text-center text-lg font-bold text-white">
            {album.title}
          </h5>
        </div>
      </Link>
    </div>
  );
};

export default AlbumItem;
