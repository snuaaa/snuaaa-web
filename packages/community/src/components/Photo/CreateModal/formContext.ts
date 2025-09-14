import { formOptions } from '@tanstack/react-form';
import { CreatePhotoRequest } from '~/services/PhotoService';

export const formOptionsCreatePhoto = formOptions({
  defaultValues: {
    list: [],
    board_id: '',
    album_id: undefined,
  } as CreatePhotoRequest,
});
