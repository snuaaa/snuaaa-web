import { FC } from 'react';
import { Album } from '~/services/types';
import { Link } from '@tanstack/react-router';
import Image from '../../Common/AaaImage';
import defaultAlbumCover from '~/assets/img/default_photo_img.png';
import { getThumbnailPath } from '~/utils/getThumbnailPath';

type Props = {
  album: Album;
};

const AlbumItem: FC<Props> = ({ album }) => {
  const thumbnailPath = getThumbnailPath(album);

  return (
    <div className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300">
      <Link
        to="/album/$album_id"
        params={{ album_id: String(album.content_id) }}
      >
        <Image
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          imgSrc={thumbnailPath}
          defaultImgSrc={defaultAlbumCover}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-3 group-hover:from-black/70 transition-all duration-300">
          <h5 className="text-white text-sm font-bold drop-shadow-md leading-tight">
            {album.title}
          </h5>
        </div>
      </Link>
    </div>
  );
};

export default AlbumItem;
