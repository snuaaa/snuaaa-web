import ContentType from './ContentType';
import PhotoType from './PhotoType';

interface AlbumType extends ContentType {
    album: {
        is_private: boolean,
        thumbnail: PhotoType
    },
    children: PhotoType[]
}

export default AlbumType;
