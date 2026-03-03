import { Link } from '@tanstack/react-router';
import Image from '../Common/AaaImage';
import { Photo } from '~/services/types';

type NewPhotosProps = {
  title: string;
  board_id: string;
  photos: Photo[];
};

function NewPhotos({ title, board_id, photos }: NewPhotosProps) {
  return (
    <div>
      <Link
        to="/board/$board_id"
        params={{ board_id }}
        className="flex items-center gap-2 mb-5 text-white font-extrabold text-lg tracking-tight no-underline"
      >
        <i className="ri-camera-lens-line text-xl text-[#49A0AE]"></i>
        <span>{title}</span>
        <div className="flex-1 h-0.5 ml-3 bg-gradient-to-r from-[#49A0AE] to-transparent rounded-full opacity-40"></div>
      </Link>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
        {photos.map((content) => (
          <div
            key={content.content_id}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
          >
            <Link
              to="."
              search={(prev) => ({
                ...prev,
                photo: content.content_id,
              })}
            >
              {content.photo && (
                <Image
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  imgSrc={
                    content.photo.thumbnail_url ?? content.photo.thumbnail_path
                  }
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewPhotos;
