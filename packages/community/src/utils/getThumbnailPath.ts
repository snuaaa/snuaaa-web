import { Album } from 'services/types';

export const getThumbnailPath = (album: Album): string | undefined => {
  const thumbnailPhoto =
    album.album.thumbnail?.photo ?? album.children?.[0]?.photo;

  if (!thumbnailPhoto) {
    return;
  }

  return thumbnailPhoto.thumbnail_url ?? thumbnailPhoto.thumbnail_path;
};
