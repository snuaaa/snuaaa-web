import AlbumType from './AlbumType';
import ContentType from './ContentType';

interface PhotoType extends ContentType {
    parent?: AlbumType,
    photo: {
        file_path: string,
        thumbnail_path: string,
        location?: string,
        camera?: string,
        lens?: string
        exposure_time?: string
        focal_length?: string
        f_stop?: string
        iso?: string
        date?: Date
        // album_id?: number
    }
}

export default PhotoType;
