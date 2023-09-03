import UserType from './UserType';

interface CrtExhibitPhotoType {
    title: string,
    text: string,
    order: number,
    photographer: UserType,
    photographer_alt: string,
    date?: Date,
    location?: string,
    camera?: string,
    lens?: string,
    focal_length?: string,
    f_stop?: string,
    exposure_time?: string,
    iso?: string,
}

export default CrtExhibitPhotoType;