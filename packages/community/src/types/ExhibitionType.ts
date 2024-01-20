import ContentType from './ContentType';

interface ExhibitionType extends ContentType {
    exhibition: {
        exhibition_no: number;
        slogan: string;
        date_start: Date;
        date_end: Date;
        place: string;
        poster_path: string;
        poster_thumbnail_path: string;
    }
}

export default ExhibitionType;
