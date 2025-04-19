import { Link } from 'react-router-dom';
import defaultAlbumCover from '~/assets/img/default_photo_img.png';
import defaultStarAlbumCover from '~/assets/img/default_photo_img_star.png';
import Image from '../Common/AaaImage';
import { Album } from '~/services/types';
import { getThumbnailPath } from '~/utils/getThumbnailPath';

type AlbumListProps = {
  board_id: string;
  albums: Album[];
};

function AlbumList({ board_id, albums }: AlbumListProps) {
  const makeAlbumList = () => {
    const albumCover =
      board_id === 'brd32' ? defaultStarAlbumCover : defaultAlbumCover;

    const albumList = albums.map((album) => {
      const contentInfo = album;
      const categoryInfo = album.category;
      // let thumbnailInfo = album.thumbnail && album.thumbnail.photo
      const thumbnailPath = getThumbnailPath(album);

      let color;
      if (categoryInfo && categoryInfo.category_color) {
        color = {
          borderTopColor: categoryInfo.category_color,
        };
      }

      return (
        <div className="album-list" key={album.content_id}>
          <Link to={`/album/${album.content_id}`}>
            <Image imgSrc={thumbnailPath} defaultImgSrc={albumCover} />
            <div className="album-cover">
              <div className="album-category-marker" style={color}></div>
              <h5>{contentInfo.title}</h5>
            </div>
          </Link>
        </div>
      );
    });
    return albumList;
  };

  return <div className="album-list-wrapper">{makeAlbumList()}</div>;
}

export default AlbumList;
