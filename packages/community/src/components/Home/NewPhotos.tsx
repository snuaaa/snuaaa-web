import { Link, useLocation } from 'react-router-dom';
import Image from '../Common/AaaImage';
import { Photo } from '~/services/types';

type NewPhotosProps = {
  title: string;
  board_id: string;
  photos: Photo[];
};

function NewPhotos({ title, board_id, photos }: NewPhotosProps) {
  const location = useLocation();

  return (
    <div className="w-full md:w-1/2 p-2 md:p-[5px]">
      <Link to={`/board/${board_id}`}>
        <h4 className="text-xl font-bold text-[#7193C4] py-2 px-1">{title}</h4>
      </Link>
      <div className="grid grid-cols-3 grid-rows-3 aspect-[1/1] gap-px">
        {photos.map((content) => {
          return (
            <div key={content.content_id} className="relative pb-full">
              <Link
                to={{
                  pathname: `/photo/${content.content_id}`,
                  state: {
                    modal: true,
                    backgroundLocation: location,
                  },
                }}
              >
                {content.photo && (
                  <Image
                    className="absolute object-cover h-full w-full"
                    imgSrc={
                      content.photo.thumbnail_url ??
                      content.photo.thumbnail_path
                    }
                  />
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NewPhotos;
