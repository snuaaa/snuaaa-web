import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import ExhibitPhotoService, {
  CreateExhibitPhotoRequest,
  UpdateExhibitPhotoRequest,
} from '~/services/ExhibitPhotoService';

// Query keys
export const exhibitPhotoKeys = {
  all: ['exhibitPhotos'] as const,
  detail: (id: number) => [...exhibitPhotoKeys.all, 'detail', id] as const,
};

// Query options
export const exhibitPhotoQueryOptions = (id: number) =>
  queryOptions({
    queryKey: exhibitPhotoKeys.detail(id),
    queryFn: () => ExhibitPhotoService.retrieveExhibitPhoto(id),
  });

// Hooks
export function useExhibitPhoto(id: number) {
  return useQuery(exhibitPhotoQueryOptions(id));
}

export function useCreateExhibitPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exhibition_id,
      data,
    }: {
      exhibition_id: number;
      data: CreateExhibitPhotoRequest;
    }) => ExhibitPhotoService.createExhibitPhoto(exhibition_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exhibitPhotoKeys.all });
    },
  });
}

export function useUpdateExhibitPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exhibitPhoto_id,
      data,
    }: {
      exhibitPhoto_id: number;
      data: UpdateExhibitPhotoRequest;
    }) => ExhibitPhotoService.updateExhibitPhoto(exhibitPhoto_id, data),
    onSuccess: (_, { exhibitPhoto_id }) => {
      queryClient.invalidateQueries({
        queryKey: exhibitPhotoKeys.detail(exhibitPhoto_id),
      });
    },
  });
}

export function useDeleteExhibitPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exhibitPhoto_id: number) =>
      ExhibitPhotoService.deleteExhibitPhoto(exhibitPhoto_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exhibitPhotoKeys.all });
    },
  });
}
