import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import ExhibitionService, {
  CreateExhibitionRequest,
} from '~/services/ExhibitionService';
import ExhibitPhotoService, {
  CreateExhibitPhotoRequest,
  UpdateExhibitPhotoRequest,
} from '~/services/ExhibitPhotoService';
import { exhibitPhotoKeys } from './useExhibitPhotoQueries';

// Query keys
export const exhibitionKeys = {
  all: ['exhibitions'] as const,
  detail: (id: number) => [...exhibitionKeys.all, 'detail', id] as const,
  inBoard: (boardId: string) =>
    [...exhibitionKeys.all, 'inBoard', boardId] as const,
};

// Query options
export const exhibitionQueryOptions = (exhibitionId: number) =>
  queryOptions({
    queryKey: exhibitionKeys.detail(exhibitionId),
    queryFn: async () => {
      const [exhibition, exhibitPhotos] = await Promise.all([
        ExhibitionService.retrieveExhibition(exhibitionId),
        ExhibitPhotoService.retrieveExhibitPhotosinExhibition(exhibitionId),
      ]);
      return { exhibition, exhibitPhotos };
    },
  });

export const exhibitionsInBoardQueryOptions = (boardId: string) =>
  queryOptions({
    queryKey: exhibitionKeys.inBoard(boardId),
    queryFn: () => ExhibitionService.retrieveExhibitionsInBoard(boardId),
  });

// Hooks
export function useExhibition(exhibitionId: number) {
  return useQuery(exhibitionQueryOptions(exhibitionId));
}

export function useExhibitionsInBoard(boardId: string) {
  return useQuery(exhibitionsInBoardQueryOptions(boardId));
}

export function useCreateExhibition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      board_id,
      data,
    }: {
      board_id: string;
      data: CreateExhibitionRequest;
    }) => ExhibitionService.createExhibition(board_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exhibitionKeys.all });
    },
  });
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
      queryClient.invalidateQueries({ queryKey: exhibitionKeys.all });
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
      queryClient.invalidateQueries({ queryKey: exhibitionKeys.all });
      queryClient.invalidateQueries({
        queryKey: exhibitPhotoKeys.detail(exhibitPhoto_id),
      });
    },
  });
}
