import {
  createFormHook,
  createFormHookContexts,
  formOptions,
} from '@tanstack/react-form';
import { CreatePhotoRequest } from '~/services/PhotoService';
import { Input } from './Form/Input';

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Input,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export const formOptionsCreatePhoto = formOptions({
  defaultValues: {
    list: [],
    board_id: '',
    album_id: undefined,
  } as CreatePhotoRequest,
});
