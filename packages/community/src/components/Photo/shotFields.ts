import { UpdatePhotoRequest } from '~/services/PhotoService';

export type ShotField = keyof UpdatePhotoRequest['photo'];

/** 촬영 정보 inputs, shared by 사진 올리기 and 사진 정보 수정. */
export const SHOT_FIELDS: {
  key: ShotField;
  label: string;
  placeholder?: string;
}[] = [
  { key: 'date', label: '촬영일' },
  { key: 'location', label: '장소' },
  { key: 'camera', label: '카메라' },
  { key: 'lens', label: '렌즈' },
  { key: 'focal_length', label: '초점거리', placeholder: 'mm' },
  { key: 'f_stop', label: '조리개', placeholder: 'f/' },
  { key: 'exposure_time', label: '노출', placeholder: '초' },
  { key: 'iso', label: 'ISO' },
];
