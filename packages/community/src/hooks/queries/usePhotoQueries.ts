import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PhotoService, { CreatePhotoRequest, UpdatePhotoRequest } from '~/services/PhotoService';
import { Photo, Tag } from '~/services/types';

type RetrievePhotoListParams = {
  board_id?: string;
  offset?: number;
  limit?: number;
  user_uuid?: string;
  tags?: Tag['tag_id'][];
};

// Query keys
export const photoKeys = {
  all: ['photos'] as const,
  list: (params?: RetrievePhotoListParams) => [...photoKeys.all, 'list', ...(params ? [params] : [])] as const,
  detail: (id: number) => [...photoKeys.all, 'detail', id] as const,
};

// Hook for fetching photo list
export function usePhotoList(params: RetrievePhotoListParams) {
  return useQuery({
    queryKey: photoKeys.list(params),
    queryFn: () => PhotoService.retrievePhotoList(params),
  });
}

// Hook for fetching photo detail
export function usePhotoDetail(id: number) {
  return useQuery({
    queryKey: photoKeys.detail(id),
    queryFn: () => PhotoService.retrievePhoto(id),
  });
}

// Hook for creating photo
export function useCreatePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePhotoRequest) => PhotoService.createPhoto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.list() });
    },
  });
}

export function useUpdatePhoto(photoId: Photo['content_id']) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePhotoRequest) => PhotoService.updatePhoto(photoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.detail(photoId) });
    },
  });
}

export function useDeletePhoto(photoId: Photo['content_id']) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => PhotoService.deletePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.list() });
    },
  });
}
