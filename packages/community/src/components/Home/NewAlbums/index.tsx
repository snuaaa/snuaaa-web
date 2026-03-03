import { Link } from '@tanstack/react-router';
import { Album } from '~/services/types';
import AlbumItem from './AlbumItem';

type NewAlbumsProps = {
  title: string;
  board_id: string;
  albums: Album[];
};

function NewAlbums({ title, board_id, albums }: NewAlbumsProps) {
  return (
    <div>
      <Link
        to="/board/$board_id"
        params={{ board_id }}
        className="flex items-center gap-2 mb-5 text-[#000E2C] font-extrabold text-lg tracking-tight no-underline"
      >
        <i className="ri-gallery-line text-xl text-[#49A0AE]"></i>
        <span>{title}</span>
        <div className="flex-1 h-0.5 ml-3 bg-gradient-to-r from-[#49A0AE] to-[#74B9FF] rounded-full opacity-30"></div>
      </Link>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {albums.map((album) => (
          <AlbumItem key={album.content_id} album={album} />
        ))}
      </div>
    </div>
  );
}

export default NewAlbums;
