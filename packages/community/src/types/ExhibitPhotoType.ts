import ContentType from './ContentType';
import UserType from './UserType';
import ExhibitionType from './ExhibitionType';

interface ExhibitPhotoType extends ContentType {
    parent: ExhibitionType,
    exhibitPhoto: {
        exhibition_id: number,
        order: number,
        photographer_id: number,
        photographer: UserType,
        photographer_alt: string,
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
    }
}

export default ExhibitPhotoType;
