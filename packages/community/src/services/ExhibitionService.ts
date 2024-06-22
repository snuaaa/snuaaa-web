import { API } from './index';
import { Board, Exhibition, User } from './types';

export interface CreateExhibitionRequest {
  title: string;
  text: string;
  exhibition_no: string;
  slogan: string;
  date_start: Date;
  date_end: Date;
  place: string;
  poster: File;
}

type ExhibitionInfo = Exhibition & {
  user: Pick<
    User,
    'user_id' | 'nickname' | 'introduction' | 'profile_path' | 'deleted_at'
  >;
  board: Pick<Board, 'board_id' | 'board_name' | 'lv_read'>;
};

type RetrieveExhibitionListResponse = ExhibitionInfo[];

const ExhibitionService = {
  retrieveExhibition: function (exhibition_id: number) {
    return API.get<{ exhibitionInfo: ExhibitionInfo }>(
      `exhibition/${exhibition_id}`,
    );
  },

  createExhibition: function (board_id: string, data: CreateExhibitionRequest) {
    const {
      title,
      text,
      exhibition_no,
      slogan,
      date_start,
      date_end,
      place,
      poster,
    } = data;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    formData.append('exhibition_no', exhibition_no.toString());
    formData.append('slogan', slogan);
    formData.append('date_start', date_start.toString());
    formData.append('date_end', date_end.toString());
    formData.append('place', place);
    formData.append('poster', poster);

    return API.post(`board/${board_id}/exhibition`, formData);
  },

  retrieveExhibitionsInBoard: function (board_id: string) {
    return API.get<RetrieveExhibitionListResponse>(
      `board/${board_id}/exhibitions`,
    );
  },

  // TODO: server 구현
  // updateExhibition: function (exhibition_id: number, data: any) {
  //   return API.patch(`exhibition/${exhibition_id}`, data);
  // },
};

export default ExhibitionService;
