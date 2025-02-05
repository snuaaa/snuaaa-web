export interface User {
  user_id: number;
  user_uuid?: string;
  id?: string;
  username?: string;
  aaa_no?: string;
  nickname: string;
  col_no?: string;
  major?: string;
  email?: string;
  mobile?: string;
  introduction?: string;
  profile_path: string;
  grade: number;
  level: number;
  login_at?: string;
  created_at?: string;
  deleted_at?: string;
}

export interface Category {
  category_id: string;
  board_id: string;
  category_name: string;
  category_color: string;
}

export interface Tag {
  tag_id: string;
  board_id: string;
  tag_name: string;
  tag_type: string;
}

export interface Board {
  board_id: string;
  board_name: string;
  board_type: 'N' | 'M' | 'A' | 'D' | 'E'; // TODO: fix magic characters
  board_desc: string;
  menu: number;
  order: number;
  lv_read: number;
  lv_write: number;
  lv_edit: number;
  tags: Tag[];
  categories: Category[];
}

export interface Content {
  content_id: number;
  content_uuid?: string;
  author_id?: number;
  board_id: string;
  category_id?: string;
  type?: string;
  title: string;
  text: string;
  view_num: number;
  comment_num: number;
  like_num: number;
  createdAt: string;
  updatedAt: string;
  board: Board;
  user: User;
  tags?: Tag[];
  category?: Category;
  attachedFiles?: File[];
}

export interface Album extends Content {
  album: {
    is_private: boolean;
    thumbnail: Photo;
  };
  children: Photo[];
}

export interface Photo extends Content {
  parent?: Album;
  photo: {
    file_path?: string;
    thumbnail_path?: string;
    img_url?: string;
    thumbnail_url?: string;
    location?: string;
    camera?: string;
    lens?: string;
    exposure_time?: string;
    focal_length?: string;
    f_stop?: string;
    iso?: string;
    date?: Date;
  };
}

export interface File {
  file_id: number;
  parent_id: number;
  original_name: string;
  file_path: string;
  file_type: string;
  download_count: number;
}

export interface Exhibition extends Content {
  exhibition: {
    exhibition_no: number;
    slogan: string;
    date_start: Date;
    date_end: Date;
    place: string;
    poster_path: string;
    poster_thumbnail_path: string;
  };
}

export interface ExhibitPhoto extends Content {
  parent: Exhibition;
  exhibitPhoto: {
    exhibition_id: number;
    order: number;
    photographer_id: number;
    photographer: User;
    photographer_alt: string;
    file_path: string;
    thumbnail_path: string;
    location?: string;
    camera?: string;
    lens?: string;
    exposure_time?: string;
    focal_length?: string;
    f_stop?: string;
    iso?: string;
    date?: Date;
  };
}

export interface Comment {
  comment_id: number;
  comment_uuid: string;
  parent_id: number;
  author_id: number;
  text: string;
  like_num: number;
  createdAt: string;
  updatedAt: string;
  content: Content;
  user: User;
  parent_comment_id: number;
  children: Comment[];
  likeUsers: User[];
}

// TODO: value 개선
export enum EquipmentStatus {
  OK = 'OK',
  BROKEN = 'BROKEN',
  LOST = 'LOST',
  REPAIRING = 'REPAIRING',
  ETC = 'ETC',
}

export enum EquipmentRentStatus {
  RENTABLE = 'RENTABLE',
  RENTED = 'RENTED',
  UNRENTABLE = 'UNRENTABLE',
}

// TODO: match DTO with server API
export interface Equipment {
  id: number;
  category_id: number;
  name: string;
  nickname: string;
  description: string;
  location: string;
  maker: string;
  status: EquipmentStatus;
  rent_status: EquipmentRentStatus;
  renter?: User;
  start_date?: string;
  end_date?: string;
  img_path: string;
}

export interface EquipmentCategory {
  id: number;
  name: string;
}
