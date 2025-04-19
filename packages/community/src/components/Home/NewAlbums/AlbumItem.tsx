import { FC } from 'react';
import { Album } from '~/services/types';
import { Link } from 'react-router-dom';
import Image from '../../Common/AaaImage';
import defaultAlbumCover from '~/assets/img/default_photo_img.png';
import { getThumbnailPath } from '~/utils/getThumbnailPath';

type Props = {
  album: Album;
};

const AlbumItem: FC<Props> = ({ album }) => {
  const thumbnailPath = getThumbnailPath(album);

  return (
    <div className="relative pb-full">
      <Link
        to={{
          pathname: `/album/${album.content_id}`,
        }}
      >
        <Image
          className="w-full h-full object-cover"
          imgSrc={thumbnailPath}
          defaultImgSrc={defaultAlbumCover}
        />
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
