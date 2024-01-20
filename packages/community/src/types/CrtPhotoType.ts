import TagType from './TagType';

interface CrtPhotoType {
    board_id?: string,
    album_id?: number,
    title?: string,
    text?: string,
    file_path?: string,
    thumbnail_path?: string,
    location?: string,
    camera?: string,
    lens?: string
    exposure_time?: string
    focal_length?: string
    f_stop?: string
    iso?: string
    date?: Date
    tags?: string[]
}

export default CrtPhotoType;
