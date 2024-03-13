import { API } from './index';
import { Board, Exhibition, User } from './types';

export interface CreateExhibitionRequest {
  poster: File;
  exhibition_no: string;
  slogan: string;
  date_start: string;
  date_end: string;
  place: string;
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
    // TODO: CreateExhibition.js 수정과 함께 FormData 변환로직 추가
    return API.post(`board/${board_id}/exhibition`, data);
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
