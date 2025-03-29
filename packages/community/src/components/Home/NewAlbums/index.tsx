import { Link } from 'react-router-dom';
import { Album } from '~/services/types';
import AlbumItem from './AlbumItem';

type NewAlbumsProps = {
  title: string;
  board_id: string;
  albums: Album[];
};

function NewAlbums({ title, board_id, albums }: NewAlbumsProps) {
  return (
    <div className="w-full md:w-1/2 p-2 md:p-[5px]">
      <Link to={`/board/${board_id}`}>
        <h4 className="text-xl font-bold text-[#7193C4] py-2 px-1">{title}</h4>
      </Link>
      <div className="grid grid-cols-2 grid-rows-2 gap-px aspect-[1/1]">
        {albums.map((album) => (
          <AlbumItem key={album.content_id} album={album} />
        ))}
      </div>
    </div>
  );
}

export default NewAlbums;
